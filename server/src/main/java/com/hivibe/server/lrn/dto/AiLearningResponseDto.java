package com.hivibe.server.lrn.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiLearningResponseDto(
    OptimizedCodeDto optimizedCode,
    List<ConceptDto> concepts,
    List<BlankDto> blanks
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

    /**
     * 빈칸 정답
     *
     * @param order        {{BLANK_N}}의 N (1부터)
     * @param answer       빈칸에 들어갈 정답 텍스트
     * @param conceptIndex 이 빈칸과 연결된 concepts 배열의 인덱스 (0-based, 없으면 null)
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record BlankDto(
        Integer order,
        String answer,
        Integer conceptIndex
    ) {}
}