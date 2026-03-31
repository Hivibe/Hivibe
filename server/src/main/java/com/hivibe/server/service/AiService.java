package com.hivibe.server.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hivibe.server.dto.AiResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class AiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    // TODO: 엔티티 완성 후 주입
    // AnlsRepository는 ANLS 테이블 담당, OptCdRepository는 OPT_CD 테이블 담당
    // private final AnlsRepository anlsRepository;
    // private final OptCdRepository optCdRepository;
    
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

           [채점 기준]
            - accuracy: 엣지 케이스(null, 빈 배열) 미처리 시 -20점씩.
            정수 오버플로우 가능한 mid 계산((left+right)/2) 사용 시 -15점 추가.
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
            * 언어 네이밍 컨벤션 미준수(Java인데 snake_case 사용 등) 시 -15점
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
            "complexity": "O(n²)"
            "optimizedCode": "최적화된 전체 코드를 문자열로. 마크다운 금지, 순수 코드만."
            }

            [분석할 코드]
            """ + userCode;
 Map<String, Object> requestBody = Map.of(
            "contents", new Object[]{
                Map.of("parts", new Object[]{
                    Map.of("text", systemPrompt)
                })
            },
            "generationConfig", Map.of("responseMimeType", "application/json")
        );

        try {
            String rawResponse = restClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
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

           // ANLS 테이블에 분석 결과 저장
            // Gemini가 돌려준 result(AiResponseDto)를 ANLS 엔티티 객체로 변환
            // builder() 패턴 = 필드 하나씩 세팅해서 객체 만드는 방식
            // Anls anls = Anls.builder()
            //     .cdGrd(result.getGrade())       // 등급 (S/A/B/C/F) - AiResponseDto에 getGrade() 메서드 추가 필요
            //     .cdScr(result.totalScore())     // 총점 (0~100)
            //     .cdEfcn(String.valueOf(result.efficiency()))    // 효율성 점수
            //     .cdRead(String.valueOf(result.readability()))   // 가독성 점수
            //     .cdStyle(String.valueOf(result.style()))        // 스타일 점수
            //     .timeComp(result.complexity())                 // 시간복잡도 예: "O(n²)"
            //     .cdEfcnRsn(result.efficiencyReason())          // 효율성 감점 이유
            //     .cdAccRsn(result.accuracyReason())             // 정확성 감점 이유
            //     .cdReadRsn(result.readabilityReason())         // 가독성 감점 이유
            //     .cdStyleRsn(result.styleReason())              // 스타일 감점 이유
            //     .aiSummary(result.summary())                   // AI 전체 요약
            //     .build();
            //
            // Anls savedAnls = anlsRepository.save(anls);
            // → save() 하면 DB에 INSERT되고, AUTO_INCREMENT된 ANLS_ID가 savedAnls에 담김
            // → 이 ANLS_ID를 아래 OPT_CD 저장할 때 FK로 사용함


            // ── STEP 3: OPT_CD 테이블에 최적화 코드 저장 ──────────────────────────
            // ANLS 저장이 먼저 돼야 ANLS_ID를 알 수 있음 → 반드시 STEP 2 이후에 실행
            // OptCd optCd = OptCd.builder()
            //     .anlsId(savedAnls.getAnlsId())  // STEP 2에서 저장된 ANLS_ID를 FK로 연결
            //                                     // 이게 없으면 어떤 분석의 최적화코드인지 알 수 없음
            //     .cdCn(result.optimizedCode())   // Gemini가 만들어준 최적화 코드 전체
            //     .timeComp(result.complexity())  // 최적화 후 시간복잡도
            //     .build();
            //
            // optCdRepository.save(optCd);
            // → OPT_CD 테이블에 INSERT

            return result;

        } catch (Exception e) {
            System.err.println("에러 발생: " + e.getMessage());
            return new AiResponseDto(
                "AI 분석 중 서버 오류가 발생했습니다.",
                0, 0, "-", 0, "-", 0, "-", 0, "-", "O(1)", ""
            );
        }
    }
}