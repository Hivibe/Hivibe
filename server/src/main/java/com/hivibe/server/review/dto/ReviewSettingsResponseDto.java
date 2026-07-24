package com.hivibe.server.review.dto;

import com.hivibe.server.domain.entity.User;

public record ReviewSettingsResponseDto(
        boolean enabled,
        int hour
) {
    public static ReviewSettingsResponseDto from(User user) {
        return new ReviewSettingsResponseDto(
                user.isReviewAlarmOn(),
                user.getReviewAlarmHour() == null ? 9 : user.getReviewAlarmHour()
        );
    }
}