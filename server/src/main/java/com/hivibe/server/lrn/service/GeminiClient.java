package com.hivibe.server.lrn.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClient {

    private static final String ENDPOINT =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 2000L;

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public String generateJson(String prompt) {
        String url = ENDPOINT + "?key=" + apiKey;

        Map<String, Object> body = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            ),
            "generationConfig", Map.of(
                "responseMimeType", "application/json",
                "temperature", 0.4
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        long backoffMs = INITIAL_BACKOFF_MS;
        HttpServerErrorException lastException = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                String response = restTemplate.postForObject(url, entity, String.class);
                JsonNode root = objectMapper.readTree(response);
                JsonNode textNode = root
                    .path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text");

                if (textNode.isMissingNode()) {
                    log.error("Gemini 응답 구조 이상. raw={}", response);
                    throw new IllegalStateException("Gemini 응답에서 text를 찾을 수 없습니다.");
                }
                return textNode.asText();

            } catch (HttpServerErrorException e) {
                // 5xx (503 등) → 재시도
                lastException = e;
                log.warn("Gemini API {}xx 응답. 시도 {}/{}, {}ms 후 재시도",
                    e.getStatusCode().value(), attempt, MAX_RETRIES, backoffMs);

                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(backoffMs);
                        backoffMs *= 2; // exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("재시도 대기 중 인터럽트", ie);
                    }
                }

            } catch (Exception e) {
                // 5xx 외 다른 예외는 즉시 throw
                log.error("Gemini API 호출 실패 (재시도 불가)", e);
                throw new RuntimeException("Gemini API 호출 실패: " + e.getMessage(), e);
            }
        }

        // 모든 재시도 실패
        log.error("Gemini API 호출 실패 (최대 재시도 초과)", lastException);
        throw new RuntimeException(
            "Gemini API가 일시적으로 사용 불가능합니다. 잠시 후 다시 시도해주세요.",
            lastException
        );
    }
}