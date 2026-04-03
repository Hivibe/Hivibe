package com.hivibe.server.dgns.dto;

public record DiagnosisSaveRequestDto(
    String name,
    String lang,
    String content,
    String isStable,
    String grade,
    int score,
    String summary,
    int accuracy,
    String accuracyReason,
    int efficiency,
    String efficiencyReason,
    int readability,
    String readabilityReason,
    int style,
    String styleReason,
    String timeComplexity,
    String optimizedCode
) {}