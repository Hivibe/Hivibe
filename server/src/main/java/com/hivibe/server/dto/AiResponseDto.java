package com.hivibe.server.dto;

public record AiResponseDto(
    String summary,
    int totalScore,
    int accuracy,
    String accuracyReason,
    int efficiency,
    String efficiencyReason,
    int readability,
    String readabilityReason,
    int style,
    String styleReason,
    String complexity
) {
}