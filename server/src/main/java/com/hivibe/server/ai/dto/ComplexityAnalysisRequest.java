package com.hivibe.server.ai.dto;

import java.util.List;

public record ComplexityAnalysisRequest(
        String originalCode,
        String optimizedCode,
        String language,
        List<SubmittedAnswer> answers
) {
    public record SubmittedAnswer(
            Integer blankOrd,
            String userAns
    ) {
    }
}