package com.hivibe.server.badge.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BadgeType {

    // ── 진단 관련 ──
    FIRST_SCAN("first_scan", "🔍", "First Scan", "첫 진단 결과 저장 완료"),
    SPEED_OPTIMIZER("speed_optimizer", "⚡", "Speed Optimizer", "처음으로 90점 이상 달성"),
    PERFECTIONIST("perfectionist", "💯", "Perfectionist", "100점 달성"),
    GRADE_S("grade_s", "🏆", "Grade S", "S등급 달성"),
    POLYGLOT("polyglot", "🌐", "Polyglot", "3개 이상 언어로 분석"),
    ON_FIRE("on_fire", "🔥", "On Fire", "7일 연속 분석"),
    CONSISTENT("consistent", "📅", "Consistent", "30일 연속 분석"),
    CODE_VETERAN("code_veteran", "🎖️", "Code Veteran", "진단 50회 이상"),

    // ── 노트 관련 ──
    BOOKWORM("bookworm", "📚", "Bookworm", "노트 10개 저장"),
    NOTE_MASTER("note_master", "📖", "Note Master", "노트 30개 저장"),

    // ── 학습 관련 ──
    FIRST_LEARNER("first_learner", "🎓", "First Learner", "첫 학습 완료"),
    PERFECT_ANSWER("perfect_answer", "✨", "Perfect Answer", "빈칸 채우기 100% 정답 1회"),
    STUDY_HARD("study_hard", "💪", "Study Hard", "학습 10회 완료");

    private final String key;
    private final String icon;
    private final String name;
    private final String desc;

    public static BadgeType fromKey(String key) {
        for (BadgeType type : values()) {
            if (type.key.equals(key))
                return type;
        }
        throw new IllegalArgumentException("알 수 없는 뱃지 키: " + key);
    }
}