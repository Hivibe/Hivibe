package com.hivibe.server.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hivibe.server.ai.dto.AiResponseDto; // 추가
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class AiService {

        private final RestClient restClient;
        private final ObjectMapper objectMapper;

        @Value("${gemini.api.key}")
        private String apiKey;

        @Value("${gemini.api.url}")
        private String apiUrl;

        public AiService() {
                this.restClient = RestClient.create();
                this.objectMapper = new ObjectMapper();
        }

        public AiResponseDto askGemini(String userCode) {
                // 1. 프롬프트 엔지니어링: AI에게 역할과 출력 형식을 완벽하게 강제
                String systemPrompt = """
                                 너는 알고리즘 코드 리뷰 전문 시니어 개발자야.
                                 아래 [채점 기준]을 반드시 따라서 코드를 분석하고, [출력 형식] JSON으로만 응답해. 마크다운, 설명, 코드블럭 전부 금지.

                                 너는 알고리즘 코드 리뷰 전문 시니어 개발자야. 반드시 결정론적으로 채점해. 같은 코드에는 항상 같은 점수를 내려야 해.

                                 [중요 분석 원칙]
                                - 제공된 코드에 실제로 존재하는 문제만 지적한다.
                                - 코드에서 확인할 수 없는 문제를 추측하지 않는다.
                                - 해당 코드와 관련 없는 채점 기준은 적용하지 않는다.
                                - 문제 여부가 불확실한 경우 감점하지 않는다.
                                - 모든 점수는 0 이상 100 이하의 정수로 작성한다.
                                - 감점 근거는 반드시 입력 코드에서 확인 가능한 내용이어야 한다.
                                - 존재하지 않는 변수, 함수, 라이브러리, API를 임의로 만들어내지 않는다.
                                - optimizedCode는 원본 코드의 기능을 임의로 변경하지 않는다.

                                [채점 기준]
                                 - 해당 코드에서 실제로 발생 가능한 엣지 케이스만 평가한다.
                                 - 배열 또는 컬렉션 입력이 존재하는 경우에만 빈 배열 처리를 평가한다.
                                 - null 가능성이 있는 참조형 입력이 존재하는 경우에만 null 처리를 평가한다.
                                 - 중앙 인덱스 계산이 존재하는 경우에만 정수 오버플로우 가능성을 평가한다.
                                 - 코드에 존재하지 않는 문제를 추측하여 감점하지 않는다.
                                 최대 감점 합산 적용.
                                 - efficiency (효율성, 0~100): O(n) 이하 100점, O(n log n) 80점, O(n²) 50점, O(n³) 이상 20점 이하.
                                 더 효율적인 자료구조(HashMap, HashSet 등)로 개선 가능한데 안 쓴 경우 추가 -10점.
                                 - readability (가독성, 0~100): 변수명이 한 글자(a, x, i 제외 루프변수)면 -20점.
                                 함수 분리 없이 main에 모든 로직이 있으면 -15점.
                                - style (코드 스타일, 0~100): 아래 항목별로 감점 적용.
                                 * 변수명이 의미를 알 수 없는 단어(aa, bb, xyz, tmp1, tmp2 등) 사용 시 -10점
                                 * 주석에 사용할 필요 없는 비속어/은어/이모티콘을 사용하거나(사용한 말을 직접 알려 줄 필요는 없음.), 의미 없는 주석 처리 시 -15점
                                 * 매직 넘버(의미 없는 상수 직접 사용) 시 -10점
                                 * 불필요한 중첩 조건문(else if 대신 early return 가능한 경우) 시 -10점
                                 - 변수와 함수 이름은 역할을 명확하게 알 수 있는 이름을 사용해야 한다.
                                - cnt, res, tmp, val, obj 등 의미를 축약한 이름을 불필요하게 사용하면 감점한다.
                                - count, result, temporaryValue처럼 의미가 명확한 이름을 권장한다.
                                - 단, i, j, k 같은 짧은 반복문 인덱스와 ID, URL, API처럼 일반적으로 통용되는 약어는 허용한다.
                                 * 감점 합산 후 0점 미만이면 0점으로 처리
                                 - totalScore: accuracy*0.4 + efficiency*0.3 + readability*0.15 + style*0.15
                                 단, 어느 항목이든 40점 이하인 항목이 있으면 totalScore에 추가 -10점 페널티.

                                 [복잡도 분석]
                                 - complexity: Big-O 표기법만. 예: "O(n²)", "O(n log n)", "O(1)". 설명 없이 표기법만 작성.

                                 [최적화 코드]
                                 - optimizedCode: 위 분석을 바탕으로 개선한 전체 코드.
                                 마크다운, 코드블럭(```) 절대 금지. 순수 코드 텍스트만 작성.
                                 개선할 점이 없으면 원본 코드 그대로 반환.

                                 [출력 형식]
                                 {
                                 "summary": "잘된 점 1가지(없을 경우 생략 가능)와 핵심 개선점 1가지를 포함한 2~3줄 평가.",
                                 "totalScore": 85,
                                 "accuracy": 90,
                                 "accuracyReason": "null 입력 처리가 없고 정수 오버플로우 가능한 연산을 사용함.",
                                 "efficiency": 70,
                                 "efficiencyReason": "HashMap을 사용하면 O(n)으로 줄일 수 있으나 이중 루프를 사용함.",
                                 "readability": 80,
                                 "readabilityReason": "변수명이 명확하고 early return을 적절히 사용함.",
                                 "style": 85,
                                 "styleReason": "네이밍 컨벤션을 잘 준수했으나 사용하지 않는 import가 존재함.",
                                 "complexity": "O(n²)",
                                 "optimizedCode": "최적화된 전체 코드를 문자열로. 마크다운 금지, 순수 코드만."
                                 }

                                 [분석할 코드]
                                 """
                                + userCode;
                Map<String, Object> requestBody = Map.of(
                                "contents", new Object[] {
                                                Map.of("parts", new Object[] {
                                                                Map.of("text", systemPrompt)
                                                })
                                },
                                // 바꿀 것
                                "generationConfig", Map.of(
                                                "responseMimeType", "application/json",
                                                "temperature", 0.0, // 0에 가까울수록 일관된 응답
                                                "seed", 42 // ← 추가

                                ));

                try {
                        String rawResponse = restClient.post()
                                        .uri(java.net.URI.create(apiUrl + "?key=" + apiKey))
                                        .header("Content-Type", "application/json")
                                        .body(requestBody)
                                        .retrieve()
                                        .body(String.class);

                        JsonNode rootNode = objectMapper.readTree(rawResponse);
                        String aiJsonText = rootNode.path("candidates").get(0)
                                        .path("content")
                                        .path("parts").get(0)
                                        .path("text").asText();

                        AiResponseDto result = objectMapper.readValue(aiJsonText, AiResponseDto.class);

                        // 검증한 뒤 반환
                        return validateAndNormalize(result);

                } catch (Exception e) {
                        System.err.println("에러 발생: " + e.getMessage());
                        return new AiResponseDto(
                                        "AI 분석 중 서버 오류가 발생했습니다.",
                                        0, 0, "-", 0, "-", 0, "-", 0, "-", "O(1)", "");
                }
        }

        private AiResponseDto validateAndNormalize(AiResponseDto result) {

                int accuracy = clamp(result.accuracy());
                int efficiency = clamp(result.efficiency());
                int readability = clamp(result.readability());
                int style = clamp(result.style());

                double calculated = accuracy * 0.4 +
                                efficiency * 0.3 +
                                readability * 0.15 +
                                style * 0.15;

                if (accuracy <= 40 ||
                                efficiency <= 40 ||
                                readability <= 40 ||
                                style <= 40) {
                        calculated -= 10;
                }

                int totalScore = clamp((int) Math.round(calculated));

                String complexity = normalizeComplexity(result.complexity());

                return new AiResponseDto(
                                safeText(result.summary(), "분석 결과를 생성하지 못했습니다."),
                                totalScore,
                                accuracy,
                                safeText(result.accuracyReason(), "분석 근거 없음"),
                                efficiency,
                                safeText(result.efficiencyReason(), "분석 근거 없음"),
                                readability,
                                safeText(result.readabilityReason(), "분석 근거 없음"),
                                style,
                                safeText(result.styleReason(), "분석 근거 없음"),
                                complexity,
                                result.optimizedCode() == null ? "" : result.optimizedCode());
        }

        private int clamp(int score) {
                return Math.max(0, Math.min(100, score));
        }

        private String safeText(String value, String defaultValue) {
                if (value == null || value.isBlank()) {
                        return defaultValue;
                }
                return value;
        }

        private String normalizeComplexity(String complexity) {
                if (complexity == null || complexity.isBlank()) {
                        return "O(?)";
                }

                String trimmed = complexity.trim();

                if (!trimmed.matches("O\\(.+\\)")) {
                        return "O(?)";
                }

                return trimmed;
        }
}