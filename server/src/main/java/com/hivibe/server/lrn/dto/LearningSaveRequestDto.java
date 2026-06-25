package com.hivibe.server.lrn.dto;

import java.util.List;

public record LearningSaveRequestDto(
    Long diagnosisId,
    String name,
    String tags,
    OptimizedCode optimizedCode,
    List<Concept> concepts
) {
    public record OptimizedCode(
        String lang,
        String content,
        String blank,
        String timeComplexity
    ) {}

    public record Concept(
        String type,
        String title,
        String description,
        String referenceUrl,
        Integer sortOrder
    ) {}
}