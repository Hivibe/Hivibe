package com.hivibe.server.lrn.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiLearningResponseDto(
    OptimizedCodeDto optimizedCode,
    List<ConceptDto> concepts
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record OptimizedCodeDto(
        String lang,
        String content,
        String blank,
        String timeComplexity
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ConceptDto(
        String type,
        String title,
        String description,
        String referenceUrl
    ) {}
}