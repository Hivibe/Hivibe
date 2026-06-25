package com.hivibe.server.lrn.dto;

public record BlankResultDto(
    Long blankId,
    String blankKey,
    boolean correct,
    String grdMethod,           // S(문자열) / A(AI) / N(틀림)
    String revealedAnswer       // 정답 (오답인 경우만 채워줄지 정책 결정 필요)
) {}