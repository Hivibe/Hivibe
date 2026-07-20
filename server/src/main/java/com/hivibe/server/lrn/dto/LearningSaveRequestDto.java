package com.hivibe.server.lrn.dto;

import java.util.List;

/**
 * 학습 저장 요청
 */
public record LearningSaveRequestDto(
    Long diagnosisId,
    String name,
    String tags,
    OptimizedCode optimizedCode,
    List<Concept> concepts,
    List<Blank> blanks
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

    /**
     * 빈칸 정답
     *
     * @param conceptIndex concepts 배열의 인덱스 (0-based). 저장된 Concept 엔티티와 연결용
     */
    public record Blank(
        Integer order,
        String answer,
        Integer conceptIndex
    ) {}
}