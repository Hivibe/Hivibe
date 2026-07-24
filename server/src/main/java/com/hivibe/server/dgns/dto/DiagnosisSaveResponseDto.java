package com.hivibe.server.dgns.dto;

import com.hivibe.server.user.dto.TierUpDto;

public record DiagnosisSaveResponseDto(
    Long anlsId,
    Long ornCdId,
    Long optCdId,
    Long dgnsId,
    TierUpDto tierUp 
) {}