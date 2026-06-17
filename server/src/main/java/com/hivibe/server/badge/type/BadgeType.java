package com.hivibe.server.badge.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BadgeType {

    FIRST_SCAN      ("first_scan",      "🔍", "First Scan",      "첫 코드 분석 완료"),
    SPEED_OPTIMIZER ("speed_optimizer", "⚡", "Speed Optimizer", "처음으로 90점 이상 달성"),
    PERFECTIONIST   ("perfectionist",   "💯", "Perfectionist",   "100점 달성"),
    POLYGLOT        ("polyglot",        "🌐", "Polyglot",        "3개 이상 언어로 분석"),
    ON_FIRE         ("on_fire",         "🔥", "On Fire",         "7일 연속 분석"),
    BOOKWORM        ("bookworm",        "📚", "Bookworm",        "노트 10개 저장");

    private final String key;
    private final String icon;
    private final String name;
    private final String desc;

    public static BadgeType fromKey(String key) {
        for (BadgeType type : values()) {
            if (type.key.equals(key)) return type;
        }
        throw new IllegalArgumentException("알 수 없는 뱃지 키: " + key);
    }
}