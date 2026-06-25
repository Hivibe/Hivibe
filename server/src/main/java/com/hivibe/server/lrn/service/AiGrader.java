package com.hivibe.server.lrn.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hivibe.server.lrn.dto.GeminiGradingResultDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiGrader {

    private final GeminiClient geminiClient;
    private final GradingPromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;

    /**
     * AI 의미 비교로 정답 여부 판단.
     * - Gemini 호출 실패 시 false 반환 (안전한 기본값)
     */
    public boolean isEquivalent(String lang, String expectedAnswer, String userAnswer, String templateContext) {
        try {
            String prompt = promptBuilder.build(lang, expectedAnswer, userAnswer, templateContext);
            String rawJson = geminiClient.generateJson(prompt);

            GeminiGradingResultDto result = objectMapper.readValue(rawJson, GeminiGradingResultDto.class);
            log.info("[AI Grading] equivalent={}, reason={}", result.equivalent(), result.reason());
            return result.equivalent();
        } catch (Exception e) {
            log.warn("[AI Grading] AI 채점 실패. 오답 처리. expected={}, user={}",
                expectedAnswer, userAnswer, e);
            return false;
        }
    }
}