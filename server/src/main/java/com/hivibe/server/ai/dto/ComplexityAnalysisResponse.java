package com.hivibe.server.ai.dto;

public record ComplexityAnalysisResponse(
        String originalComplexity,
        String optimizedComplexity,
        String submittedComplexity
) {
}