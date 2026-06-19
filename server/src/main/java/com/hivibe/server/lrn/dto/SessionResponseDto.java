package com.hivibe.server.lrn.dto;

import java.util.List;

public record SessionResponseDto(
    Long lrnId,
    Long optCdId,
    Long ornCdId,
    String difficulty,
    String lang,
    String originalCode,
    String optimizedCode,
    String templateCode,
    List<BlankSummaryDto> blanks,
    List<ConceptDto> concepts
) {}