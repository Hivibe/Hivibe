package com.hivibe.server.lrn.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * AI 채점 결과 (Gemini 응답 파싱용)
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AiGradeResult(
    boolean equivalent,
    String diffNote,
    String recommend,
    String securityNote
) {}