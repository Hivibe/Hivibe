package com.hivibe.server.lrn.dto;

public record SessionCreateRequestDto(
    Long optCdId,
    String difficulty,
    String lrnName,
    String tag
) {}