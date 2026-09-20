package com.hivibe.server.lrn.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class GeminiClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${factchat.api-key}")
    private String apiKey;

    @Value("${factchat.base-url:https://factchat-cloud.mindlogic.ai/v1/gateway}")
    private String baseUrl;

    @Value("${factchat.model:gemini-3.8-flash}")
    private String model;

    public GeminiClient(
            ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    /**
     * FactChat Gateway의 OpenAI-compatible Chat Completions를 이용해
     * JSON 문자열 응답을 받는다.
     */
    public String generateJson(String prompt) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "SOOKMYUNG_API_KEY가 설정되어 있지 않습니다.");
        }

        String url = baseUrl.replaceAll("/+$", "")
                + "/chat/completions/";

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON);

        headers.setBearerAuth(
                apiKey);

        Map<String, Object> body = Map.of(
                "model", model,

                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", prompt)),

                "temperature", 0);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(
                body,
                headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class);

            String responseBody = response.getBody();

            if (responseBody == null ||
                    responseBody.isBlank()) {
                throw new IllegalStateException(
                        "FactChat Gateway 응답이 비어 있습니다.");
            }

            JsonNode root = objectMapper.readTree(
                    responseBody);

            JsonNode content = root.path("choices")
                    .path(0)
                    .path("message")
                    .path("content");

            if (content.isMissingNode() ||
                    !content.isTextual() ||
                    content.asText().isBlank()) {
                throw new IllegalStateException(
                        "FactChat Gateway 응답에서 content를 찾을 수 없습니다.");
            }

            return content.asText();

        } catch (HttpStatusCodeException e) {

            String bodyText = e.getResponseBodyAsString();

            log.error(
                    "FactChat Gateway 호출 실패: status={}, body={}",
                    e.getStatusCode(),
                    bodyText);

            throw new RuntimeException(
                    "FactChat Gateway 호출 실패: "
                            + e.getStatusCode()
                            + (bodyText == null ||
                                    bodyText.isBlank()
                                            ? ""
                                            : " / " + bodyText),
                    e);

        } catch (Exception e) {

            log.error(
                    "FactChat Gateway 응답 처리 실패",
                    e);

            throw new RuntimeException(
                    "FactChat Gateway 응답 처리 실패: "
                            + e.getMessage(),
                    e);
        }
    }
}