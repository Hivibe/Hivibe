package com.hivibe.server.lrn.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hivibe.server.lrn.dto.AiGradeResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * AI 의미 비교 채점기
 * - AnswerNormalizer 문자열 일치 실패 시에만 호출 (비용 절약)
 * - 정답이어도 차이점/추천사항을 함께 생성
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiGrader {

    private final GeminiClient geminiClient;
    private final GradingPromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;

    /**
     * 의미 비교 + 피드백 생성
     * - AI 호출/파싱 실패 시 오답 처리 (fail-safe)
     */
    public AiGradeResult grade(String lang, String expAns, String userAns, String codeContext) {
        String rawJson = null;
        try {
            String prompt = promptBuilder.build(
                lang == null ? "Java" : lang,
                expAns,
                userAns,
                codeContext
            );

            rawJson = geminiClient.generateJson(prompt);
            log.info("[AiGrader] Gemini 원본 응답: {}", rawJson);   // ← 추가

            return objectMapper.readValue(rawJson, AiGradeResult.class);

        } catch (Exception e) {
            log.error("AI 채점 실패 — 오답 처리. expAns={}, userAns={}, raw={}", expAns, userAns, rawJson, e);
            return new AiGradeResult(
                false,
                "AI 채점에 실패했어요. 모범답안과 직접 비교해 보세요.",
                null,
                null
            );
        }
    }
}