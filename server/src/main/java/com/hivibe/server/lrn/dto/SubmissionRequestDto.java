package com.hivibe.server.lrn.dto;

import java.util.List;

/**
 * 채점 요청
 * - 모든 빈칸을 한 번에 제출하는 정책
 */
public record SubmissionRequestDto(
    List<AnswerItem> answers
) {
    /**
     * @param blankOrd    빈칸 순번 (1부터, 프론트의 {{BLANK_N}}의 N)
     * @param userAns     사용자 입력 답
     * @param hintUsedLv  사용한 힌트 레벨 (0~3)
     */
    public record AnswerItem(
        Integer blankOrd,
        String userAns,
        Integer hintUsedLv
    ) {}
}