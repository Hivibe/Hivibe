package com.hivibe.server.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReviewSettingsRequestDto(
        @NotNull(message = "enabled는 필수입니다.")
        Boolean enabled,

        @NotNull(message = "hour는 필수입니다.")
        @Min(value = 0, message = "hour는 0 이상이어야 합니다.")
        @Max(value = 23, message = "hour는 23 이하여야 합니다.")
        Integer hour
) {}