package com.hivibe.server.lrn.dto;

import com.hivibe.server.user.dto.TierUpDto;

public record LearningSaveResponseDto(
    String message,
    Long id,
    TierUpDto tierUp
) {}