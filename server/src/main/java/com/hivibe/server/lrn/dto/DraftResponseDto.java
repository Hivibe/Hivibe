package com.hivibe.server.lrn.dto;

import java.time.LocalDateTime;
import java.util.Map;

/** 임시 답안 조회 응답 */
public record DraftResponseDto(
    Map<String, String> answers,
    LocalDateTime updatedAt
) {}