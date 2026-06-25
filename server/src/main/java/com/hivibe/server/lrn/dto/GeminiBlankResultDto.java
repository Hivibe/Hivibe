package com.hivibe.server.lrn.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GeminiBlankResultDto(
    String templateCode,
    List<BlankItem> blanks,
    List<ConceptItem> concepts
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record BlankItem(
        String blankKey,
        Integer blankOrd,
        String expectedAnswer,
        String hintLv1,
        String hintLv2,
        String hintLv3,
        String relatedConceptTitle
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ConceptItem(
        String cdType,           // "O" or "P"
        String concTitle,
        String concDesc,
        String refUrl,
        Integer sortOrd
    ) {}
}