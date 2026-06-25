package com.hivibe.server.lrn.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GeminiGradingResultDto(
    boolean equivalent,
    String reason
) {}