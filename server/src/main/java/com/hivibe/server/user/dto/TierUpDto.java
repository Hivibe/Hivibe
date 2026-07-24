package com.hivibe.server.user.dto;

import com.hivibe.server.domain.enums.UserGrd;

public record TierUpDto(
        String key,        // "GOLD"
        String name,       // "Gold"
        String label,      // "골드"
        int minCount
) {
    public static TierUpDto from(UserGrd grd) {
        String name = grd.name().charAt(0) + grd.name().substring(1).toLowerCase();
        return new TierUpDto(grd.name(), name, grd.getLabel(), grd.getMinCount());
    }
}