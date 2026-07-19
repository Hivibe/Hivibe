package com.hivibe.server.lrn.dto;

import java.time.LocalDateTime;

/**
 * 아카이브 목록 아이템
 */
public record LearningListItemDto(
    Long lrnId,
    String lrnName,
    LocalDateTime createdAt,
    String grade,
    String lang,
    String tag,
    Boolean bookmarked,
    String stat,
    Integer progRt
) {}