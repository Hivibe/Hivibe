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
                                - 같은 원인으로 여러 항목에서 과도하게 중복 감점하지 않는다.
                                - 감점 사유와 감점 점수는 반드시 위 채점 기준과 일치해야 한다.
                                - 같은 원인으로 여러 평가 항목에서 과도하게 중복 감점하지 않는다.
                                - 감점 사유와 감점 점수는 반드시 위 채점 기준과 일치해야 한다.
                                - 각 문제는 지정된 평가 항목에서만 감점한다.
                                - 같은 문제를 둘 이상의 평가 항목에서 중복 감점하지 않는다.
                                - accuracyReason과 optimizedCode의 판단은 서로 모순되면 안 된다.
                                - optimizedCode에 특정 방어 로직을 추가했다면, 그 로직이 원본 코드의 실제 문제를 해결하는 것인지 점검한다.

                                [채점 기준]
                                - accuracy (정확성, 0~100)
                                * 배열/컬렉션 등 참조형 입력을 직접 사용하는 경우 null 입력 시 예외 발생 여부를 반드시 확인한다.
                                * null 입력 시 실제 예외가 발생하고 별도 방어가 없으면 -20점.
                                * 빈 배열 입력이 실제 로직 오류를 유발하는 경우에만 -20점.
                                * 중앙 인덱스 계산에서 (left + right) / 2 형태로 정수 오버플로우 가능성이 있으면 -15점.
                                * 위 조건에 해당하지 않는 문제는 accuracy에서 감점하지 않는다.
                                * optimizedCode에 null 방어 로직을 추가했다면, 원본 코드에는 null 방어 문제가 존재한다고 판단해야 한다.

                                - efficiency (효율성, 0~100)
                                * O(1), O(log n), O(n): 100점
                                * O(n log n): 80점
                                * O(n²): 50점
                                * O(n³) 이상: 20점 이하
                                * 더 적절한 자료구조를 사용하면 시간복잡도를 명확히 개선할 수 있는데 사용하지 않은 경우 -10점.
                                * 네이밍, 스타일, null 처리 문제는 efficiency에서 감점하지 않는다.

                                - readability (가독성, 0~100)
                                * cnt, res, tmp, val, obj 등 의미를 축약한 이름을 하나 이상 사용한 경우 총 -10점.
                                * 같은 유형의 축약형 이름이 여러 개 있어도 -10점만 감점한다.
                                * 역할을 알기 어려운 단일 문자 변수 사용 시 -10점.
                                단, i, j, k 같은 반복문 인덱스는 허용한다.
                                * 하나의 함수가 여러 독립적인 책임을 수행하거나 지나치게 긴 경우 -15점.
                                * 짧고 하나의 책임만 수행하는 함수에는 함수 분리를 요구하지 않는다.
                                * 네이밍 컨벤션 위반은 readability에서 감점하지 않는다.

                                - style (코드 스타일, 0~100)
                                * Java의 camelCase, PascalCase 등 언어별 네이밍 컨벤션을 명백히 위반한 경우 -10점.
                                * 불필요한 비속어/은어/이모티콘 또는 의미 없는 주석 사용 시 -15점.
                                * 의미 있는 도메인 상수를 설명 없이 숫자 리터럴로 직접 사용하면 -10점.
                                * 반복문의 0, 1 또는 0과의 일반적인 비교는 매직 넘버로 보지 않는다.
                                * 불필요하게 깊은 중첩 조건문이 있고 early return으로 명확히 개선 가능한 경우 -10점.
                                * 축약형 변수명은 readability에서만 평가하며 style에서는 감점하지 않는다.

                                - totalScore
                                * AI는 참고용 totalScore를 반환할 수 있지만,
                                실제 최종 점수는 서버에서 다시 계산한다.
                                * 계산식:
                                accuracy*0.4 + efficiency*0.3 + readability*0.15 + style*0.15
                                * 어느 항목이든 40점 이하이면 최종 점수에서 추가 -10점.

                                 [복잡도 분석]
                                 - complexity: Big-O 표기법만. 예: "O(n²)", "O(n log n)", "O(1)". 설명 없이 표기법만 작성.

                                 [최적화 코드]
                                 - optimizedCode: 위 분석을 바탕으로 개선한 전체 코드.
                                 마크다운, 코드블럭(```) 절대 금지. 순수 코드 텍스트만 작성.
                                 개선할 점이 없으면 원본 코드 그대로 반환.
                                 - 원본 코드의 결과에 영향을 주지 않는 변수나 연산은 제거한다.
                                - 선언되거나 값이 변경되더라도 반환값, 출력, 조건식, 외부 상태 등에
                                전혀 영향을 주지 않는 변수는 optimizedCode에서 제거한다.
                                - 원본 코드의 최종 결과에 영향을 주지 않는 변수와 연산은 반드시 제거한다.
                                - 선언되거나 값이 변경되더라도 반환값, 출력, 조건식, 외부 상태 변경에 사용되지 않는 변수는 제거한다.
                                - 단순히 변수명을 바꾸는 것만으로 개선하지 말고, 불필요한 로직 자체를 제거한다.

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

                        System.out.println("===== GEMINI RAW =====");
                        System.out.println(result);

                        AiResponseDto normalized = validateAndNormalize(result);

                        System.out.println("===== NORMALIZED =====");
                        System.out.println(normalized);

                        return normalized;

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