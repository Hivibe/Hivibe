package com.hivibe.server.lrn.dto;

public record AnswerItem(
    Long blankId,
    String userAns,
    Integer hintUsedLv
) {}