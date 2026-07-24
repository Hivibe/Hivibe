package com.hivibe.server.lrn.dto;

import java.util.Map;

/** 임시 답안 저장 요청 — key: blankOrd, value: 사용자 입력값 */
public record DraftSaveRequestDto(
    Map<String, String> answers
) {}