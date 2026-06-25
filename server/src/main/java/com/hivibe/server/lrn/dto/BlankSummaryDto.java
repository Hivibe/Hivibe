package com.hivibe.server.lrn.dto;

//응답용, 정답·힌트 본문 제외

public record BlankSummaryDto(
    Long blankId,
    String blankKey,
    Integer blankOrd,
    Long concId,
    String concTitle,
    boolean hasHintLv1,
    boolean hasHintLv2,
    boolean hasHintLv3
) {}