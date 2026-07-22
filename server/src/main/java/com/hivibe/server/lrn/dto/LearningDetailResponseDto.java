package com.hivibe.server.lrn.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 학습 상세 조회 응답
 * - DiffView가 아카이브에서 학습을 열 때 사용
 * - AiLearningResponseDto와 optimizedCode/concepts 형태를 맞춤
 */
public record LearningDetailResponseDto(
    Long lrnId,
    String lrnName,
    LocalDateTime createdAt,
    String grade,
    String stat,
    Integer progRt,
    Integer lastAttemptNo,
    Boolean bookmarked,
    String tag,
    String overallComment,
    String originalCode,
    Long optCdId,
    OptimizedCodeDto optimizedCode,
    List<ConceptDto> concepts
) {
    public record OptimizedCodeDto(
        String lang,
        String content,
        String blank,
        String timeComplexity
    ) {}

    public record ConceptDto(
        String type,
        String title,
        String description,
        String referenceUrl,
        Integer sortOrder
    ) {}
}