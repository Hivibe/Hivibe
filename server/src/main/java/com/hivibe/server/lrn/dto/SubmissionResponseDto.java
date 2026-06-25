package com.hivibe.server.lrn.dto;

import java.util.List;

public record SubmissionResponseDto(
    Long lrnId,
    Integer attemptNo,
    Integer totalBlanks,
    Integer correctCount,
    Integer progRt,
    String stat,
    boolean allCorrect,
    String grade,                       // 완료 시에만 채움 (S/A/B/C)
    java.time.LocalDateTime nextReviewAt,
    List<BlankResultDto> results
) {}