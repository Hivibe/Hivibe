package com.hivibe.server.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hivibe.server.ai.dto.ComplexityAnalysisRequest;
import com.hivibe.server.ai.dto.ComplexityAnalysisResponse;
import com.hivibe.server.lrn.service.GeminiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComplexityAnalysisService {

        private static final List<String> ALLOWED_COMPLEXITIES = List.of(
                        "O(1)",
                        "O(log n)",
                        "O(n)",
                        "O(n log n)",
                        "O(n^2)",
                        "O(n^3)",
                        "O(2^n)",
                        "O(n!)");

        private final GeminiClient geminiClient;
        private final ObjectMapper objectMapper;

        public ComplexityAnalysisResponse analyze(
                        ComplexityAnalysisRequest request) {
                try {
                        String prompt = buildPrompt(request);

                        /*
                         * 기존 프로젝트에서 정상 동작 중인
                         * GeminiClient를 그대로 재사용
                         */
                        String rawJson = geminiClient.generateJson(prompt);

                        if (rawJson == null || rawJson.isBlank()) {
                                throw new IllegalStateException(
                                                "Gemini 응답이 비어 있습니다.");
                        }

                        /*
                         * 혹시 ```json ... ``` 형태로 오는 경우를 대비
                         */
                        String cleanedJson = cleanJson(rawJson);

                        ComplexityResult result = objectMapper.readValue(
                                        cleanedJson,
                                        ComplexityResult.class);

                        validateComplexity(
                                        result.originalComplexity(),
                                        "originalComplexity");

                        validateComplexity(
                                        result.optimizedComplexity(),
                                        "optimizedComplexity");

                        validateComplexity(
                                        result.submittedComplexity(),
                                        "submittedComplexity");

                        return new ComplexityAnalysisResponse(
                                        result.originalComplexity(),
                                        result.optimizedComplexity(),
                                        result.submittedComplexity());

                } catch (Exception e) {
                        log.error(
                                        "시간복잡도 분석 실패",
                                        e);

                        throw new IllegalStateException(
                                        "시간복잡도 분석 중 오류가 발생했습니다: "
                                                        + e.getMessage(),
                                        e);
                }
        }

        private String buildPrompt(
                        ComplexityAnalysisRequest request) {

                String answers = request.answers() == null
                                ? ""
                                : request.answers()
                                                .stream()
                                                .sorted(
                                                                Comparator.comparing(
                                                                                ComplexityAnalysisRequest.SubmittedAnswer::blankOrd))
                                                .map(answer -> "[빈칸 "
                                                                + answer.blankOrd()
                                                                + "]\n"
                                                                + (answer.userAns() == null
                                                                                ? ""
                                                                                : answer.userAns()))
                                                .reduce(
                                                                "",
                                                                (a, b) -> a + "\n" + b);

                return """
                                당신은 프로그래밍 학습 서비스에서
                                알고리즘의 시간복잡도를 분석하는 코드 분석기입니다.

                                아래에 제공된 세 가지 정보를 분석하세요.

                                1. 사용자가 처음 작성한 원본 코드
                                2. AI가 제안한 최적화 코드
                                3. 사용자가 최적화 코드의 빈칸에 직접 입력한 코드

                                각각의 지배적인 점근적 시간복잡도를 판단하세요.

                                시간복잡도는 반드시 아래 8개 중 하나만 사용하세요.

                                O(1)
                                O(log n)
                                O(n)
                                O(n log n)
                                O(n^2)
                                O(n^3)
                                O(2^n)
                                O(n!)

                                ========================
                                분석 규칙
                                ========================

                                1. 실제 실행 시간이 아니라 알고리즘 구조를 기준으로 판단합니다.

                                2. 반복문, 중첩 반복문, 재귀 호출,
                                   탐색 및 정렬 구조를 중심으로 분석합니다.

                                3. O(n + m), O(V + E)처럼 위 8개 분류와
                                   정확히 일치하지 않는 경우에는
                                   시각화 목적에 가장 가까운 지배적 범주를 선택합니다.

                                4. 사용자가 빈칸에 작성한 코드가
                                   정답인지 오답인지는 판단하지 마세요.

                                5. 오직 시간복잡도만 분석하세요.

                                6. 사용자의 빈칸 입력으로 인해
                                   반복 구조나 알고리즘 구조가 달라졌다면
                                   반드시 submittedComplexity에 반영하세요.

                                7. 설명, 마크다운, 코드블록을 출력하지 마세요.

                                8. 반드시 아래 JSON 구조만 반환하세요.

                                {
                                  "originalComplexity": "O(...)",
                                  "optimizedComplexity": "O(...)",
                                  "submittedComplexity": "O(...)"
                                }

                                ========================
                                프로그래밍 언어
                                ========================

                                %s

                                ========================
                                원본 코드
                                ========================

                                %s

                                ========================
                                AI 최적화 코드
                                ========================

                                %s

                                ========================
                                사용자가 입력한 빈칸
                                ========================

                                %s
                                """.formatted(
                                request.language() == null
                                                ? "알 수 없음"
                                                : request.language(),

                                request.originalCode() == null
                                                ? ""
                                                : request.originalCode(),

                                request.optimizedCode() == null
                                                ? ""
                                                : request.optimizedCode(),

                                answers);
        }

        private String cleanJson(
                        String rawJson) {
                String cleaned = rawJson.trim();

                if (cleaned.startsWith("```json")) {
                        cleaned = cleaned.substring(7);
                } else if (cleaned.startsWith("```")) {
                        cleaned = cleaned.substring(3);
                }

                if (cleaned.endsWith("```")) {
                        cleaned = cleaned.substring(
                                        0,
                                        cleaned.length() - 3);
                }

                return cleaned.trim();
        }

        private void validateComplexity(
                        String complexity,
                        String fieldName) {
                if (complexity == null ||
                                !ALLOWED_COMPLEXITIES.contains(
                                                complexity)) {
                        throw new IllegalStateException(
                                        fieldName
                                                        + " 값이 올바르지 않습니다: "
                                                        + complexity);
                }
        }

        private record ComplexityResult(
                        String originalComplexity,
                        String optimizedComplexity,
                        String submittedComplexity) {
        }
}