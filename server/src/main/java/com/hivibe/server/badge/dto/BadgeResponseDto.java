package com.hivibe.server.badge.dto;

import com.hivibe.server.domain.entity.Badge;
import com.hivibe.server.badge.type.BadgeType;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class BadgeResponseDto {

    private String key;
    private String icon;
    private String name;
    private String desc;
    private boolean achieved;
    private LocalDateTime achievedAt;

    // 획득한 뱃지
    public BadgeResponseDto(Badge badge, BadgeType type) {
        this.key        = type.getKey();
        this.icon       = type.getIcon();
        this.name       = type.getName();
        this.desc       = type.getDesc();
        this.achieved   = true;
        this.achievedAt = badge.getAchievedAt();
    }

    // 미획득 뱃지
    public BadgeResponseDto(BadgeType type) {
        this.key        = type.getKey();
        this.icon       = type.getIcon();
        this.name       = type.getName();
        this.desc       = type.getDesc();
        this.achieved   = false;
        this.achievedAt = null;
    }
}