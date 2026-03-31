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
    String complexity,
    String optimizedCode
) {
    // totalScore 기준으로 등급 자동 계산
    public String getGrade() {
        if (totalScore >= 90) return "S";
        if (totalScore >= 80) return "A";
        if (totalScore >= 70) return "B";
        if (totalScore >= 60) return "C";
        return "F";
    }
}