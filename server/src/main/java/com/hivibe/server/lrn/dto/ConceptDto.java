package com.hivibe.server.lrn.dto;

public record ConceptDto(
    Long concId,
    String cdType,
    String concTitle,
    String concDesc,
    String refUrl,
    Integer sortOrd
) {}