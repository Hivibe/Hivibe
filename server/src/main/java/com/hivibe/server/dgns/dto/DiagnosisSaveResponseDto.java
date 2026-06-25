package com.hivibe.server.dgns.dto;

public record DiagnosisSaveResponseDto(
    Long anlsId,
    Long ornCdId,
    Long optCdId,
    Long dgnsId
) {}