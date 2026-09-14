package com.hivibe.server.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.hivibe.server.ai.dto.ComplexityAnalysisRequest;
import com.hivibe.server.ai.dto.ComplexityAnalysisResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;

@Service
public class ComplexityAnalysisService {

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1/interactions";

    private static final List<String> ALLOWED_COMPLEXITIES = List.of(
            "O(1)",
            "O(log n)",
            "O(n)",
            "O(n log n)",
            "O(n^2)",
            "O(n^3)",
            "O(2^n)",
            "O(n!)"
    );

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${gemini.api-key:${GEMINI_API_KEY:}}")
    private String apiKey;

    @Value("${gemini.model:${GEMINI_MODEL:gemini-3.8-flash}}")
    private String model;

    public ComplexityAnalysisService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public ComplexityAnalysisResponse analyze(
            ComplexityAnalysisRequest request
    ) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "GEMINI_API_KEY가 설정되어 있지 않습니다."
            );
        }

        try {
            String prompt = buildPrompt(request);

            ObjectNode body = objectMapper.createObjectNode();

            body.put("model", model);
            body.put("input", prompt);

            /*
             * Structured Output
             */
            ObjectNode responseFormat =
                    body.putObject("response_format");

            responseFormat.put("type", "text");
            responseFormat.put(
                    "mime_type",
                    "application/json"
            );

            ObjectNode schema =
                    responseFormat.putObject("schema");

            schema.put("type", "object");

            ObjectNode properties =
                    schema.putObject("properties");

            addComplexityProperty(
                    properties,
                    "originalComplexity"
            );

            addComplexityProperty(
                    properties,
                    "optimizedComplexity"
            );

            addComplexityProperty(
                    properties,
                    "submittedComplexity"
            );

            ArrayNode required =
                    schema.putArray("required");

            required.add("originalComplexity");
            required.add("optimizedComplexity");
            required.add("submittedComplexity");

            HttpRequest httpRequest =
                    HttpRequest.newBuilder()
                            .uri(URI.create(GEMINI_URL))
                            .timeout(Duration.ofSeconds(30))
                            .header(
                                    "Content-Type",
                                    "application/json"
                            )
                            .header(
                                    "x-goog-api-key",
                                    apiKey
                            )
                            .POST(
                                    HttpRequest.BodyPublishers.ofString(
                                            body.toString(),
                                            StandardCharsets.UTF_8
                                    )
                            )
                            .build();

            HttpResponse<String> response =
                    httpClient.send(
                            httpRequest,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() < 200 ||
                    response.statusCode() >= 300) {

                throw new IllegalStateException(
                        "Gemini complexity analysis failed: "
                                + response.statusCode()
                                + " / "
                                + response.body()
                );
            }

            JsonNode root =
                    objectMapper.readTree(
                            response.body()
                    );

            String outputText =
                    extractOutputText(root);

            JsonNode result =
                    objectMapper.readTree(
                            outputText
                    );

            return new ComplexityAnalysisResponse(
                    result.path(
                            "originalComplexity"
                    ).asText(),

                    result.path(
                            "optimizedComplexity"
                    ).asText(),

                    result.path(
                            "submittedComplexity"
                    ).asText()
            );

        } catch (Exception e) {

            throw new IllegalStateException(
                    "시간복잡도 분석 중 오류가 발생했습니다.",
                    e
            );
        }
    }

    private void addComplexityProperty(
            ObjectNode properties,
            String name
    ) {

        ObjectNode property =
                properties.putObject(name);

        property.put("type", "string");

        ArrayNode allowed =
                property.putArray("enum");

        ALLOWED_COMPLEXITIES.forEach(
                allowed::add
        );
    }

    private String buildPrompt(
        ComplexityAnalysisRequest request
) {

    String answers =
            request.answers() == null
                    ? ""
                    : request.answers()
                    .stream()
                    .sorted(
                            Comparator.comparing(
                                    ComplexityAnalysisRequest
                                            .SubmittedAnswer
                                            ::blankOrd
                            )
                    )
                    .map(
                            answer ->
                                    "[빈칸 "
                                            + answer.blankOrd()
                                            + "]\n"
                                            + answer.userAns()
                    )
                    .reduce(
                            "",
                            (a, b) ->
                                    a
                                            + "\n"
                                            + b
                    );

    return """
            너는 프로그래밍 학습 서비스에서
            알고리즘의 시간복잡도를 분석하는 역할을 한다.

            아래의 원본 코드, AI 최적화 코드,
            사용자가 입력한 빈칸 답안을 분석하여
            각 코드의 지배적인 점근적 시간복잡도를 판단하라.

            시간복잡도는 반드시 다음 8개 중 하나로만 분류한다.

            O(1)
            O(log n)
            O(n)
            O(n log n)
            O(n^2)
            O(n^3)
            O(2^n)
            O(n!)

            [분석 규칙]

            1. 실제 실행 시간이 아니라 알고리즘 구조를 기준으로
               시간복잡도를 판단한다.

            2. 반복문, 중첩 반복문, 재귀 호출,
               탐색 및 정렬 구조를 중심으로 분석한다.

            3. O(n + m), O(V + E)처럼
               위 8개 분류에 정확히 대응되지 않는 경우에는
               그래프 시각화에 가장 적합한
               지배적인 복잡도 범주를 선택한다.

            4. 사용자의 답안이 정답인지 오답인지는 판단하지 않는다.

            5. 오직 시간복잡도만 분석한다.

            6. USER SUBMITTED BLANKS는
               AI 최적화 코드의 {{BLANK_n}} 위치에
               사용자가 입력한 코드이며,
               blankOrd 순서대로 대응된다.

            7. 사용자가 입력한 코드로 인해
               반복 구조나 알고리즘 구조가 달라졌다면
               그 영향을 반드시 submittedComplexity에 반영한다.

            8. 결과는 지정된 JSON 형식으로만 반환한다.
               설명이나 추가 문장은 작성하지 않는다.

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
            사용자 입력 빈칸
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

            answers
    );
}
    private String extractOutputText(
            JsonNode root
    ) {

        /*
         * API convenience field가 존재하는 경우
         */
        JsonNode outputText =
                root.get("output_text");

        if (outputText != null &&
                outputText.isTextual()) {

            return outputText.asText();
        }

        /*
         * Interactions API steps 구조
         */
        JsonNode steps =
                root.get("steps");

        if (steps != null &&
                steps.isArray()) {

            for (
                    int i = steps.size() - 1;
                    i >= 0;
                    i--
            ) {

                JsonNode step =
                        steps.get(i);

                JsonNode content =
                        step.get("content");

                if (content == null ||
                        !content.isArray()) {
                    continue;
                }

                for (
                        JsonNode part :
                        content
                ) {

                    JsonNode text =
                            part.get("text");

                    if (
                            text != null &&
                                    text.isTextual()
                    ) {

                        return text.asText();
                    }
                }
            }
        }

        /*
         * 일부 응답 구조 fallback
         */
        JsonNode outputs =
                root.get("outputs");

        if (outputs != null &&
                outputs.isArray()) {

            for (JsonNode output : outputs) {

                JsonNode text =
                        output.get("text");

                if (
                        text != null &&
                                text.isTextual()
                ) {

                    return text.asText();
                }
            }
        }

        throw new IllegalStateException(
                "Gemini 응답에서 text를 찾을 수 없습니다."
        );
    }
}