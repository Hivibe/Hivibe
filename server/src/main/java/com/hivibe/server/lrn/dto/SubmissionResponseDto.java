package com.hivibe.server.lrn.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 채점 응답
 */
public record SubmissionResponseDto(
    Long lrnId,
    Integer attemptNo,
    Integer totalBlanks,
    Integer correctCount,
    Integer progRt,
    String stat,
    Boolean allCorrect,
    String grade,
    LocalDateTime nextReviewAt,
    String overallComment,
    List<BlankResultDto> results
) {
    /**
     * 빈칸별 채점 결과
     *
     * @param grdMethod     S: 문자열일치 / A: AI의미일치 / N: 오답
     * @param expAns        기대 정답 (오답일 때만 노출)
     * @param diffNote      정답과의 차이점 (AI 채점 시)
     * @param recommend     개선 추천사항
     * @param securityNote  보안/안정성 지적
     * @param conceptTitle  연결된 개념 제목
     * @param conceptDesc   연결된 개념 설명 (S 판정 시 코멘트로 활용)
     */
    public record BlankResultDto(
        Long blankId,
        Integer blankOrd,
        String userAns,
        Boolean correct,
        String grdMethod,
        String expAns,
        String diffNote,
        String recommend,
        String securityNote,
        String conceptTitle,
        String conceptDesc
    ) {}
}