package com.hivibe.server.domain.enums;

public enum UserGrd {

    BASIC("베이직", 0, false),
    BRONZE("브론즈", 3, true),
    SILVER("실버", 10, true),
    GOLD("골드", 25, true),
    PLATINUM("플래티넘", 50, true),
    DIAMOND("다이아몬드", 100, true);

    private final String label;
    private final int minCount;
    /** 사용자 화면 티어 트랙에 노출할지 여부 */
    private final boolean visible;

    UserGrd(String label, int minCount, boolean visible) {
        this.label = label;
        this.minCount = minCount;
        this.visible = visible;
    }

    public String getLabel() { return label; }
    public int getMinCount() { return minCount; }
    public boolean isVisible() { return visible; }

    /** 누적 활동 수로 티어 산정 */
    public static UserGrd of(long totalCount) {
        UserGrd result = BASIC;
        for (UserGrd g : values()) {
            if (totalCount >= g.minCount) result = g;
        }
        return result;
    }

    /** 다음 티어. 최고 티어면 null */
    public UserGrd next() {
        UserGrd[] all = values();
        return (ordinal() + 1 < all.length) ? all[ordinal() + 1] : null;
    }

    public static UserGrd from(String name) {
        if (name == null || name.isBlank()) return BASIC;
        try {
            return valueOf(name.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return BASIC;
        }
    }
}