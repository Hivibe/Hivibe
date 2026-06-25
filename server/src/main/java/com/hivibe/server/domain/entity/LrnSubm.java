package com.hivibe.server.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 학습 제출 이력 엔티티
 * - 사용자가 빈칸에 입력한 답안의 채점 결과를 기록
 * - 한 번 "Check Answer" = 그 시점 전체 빈칸 개수만큼 동시 INSERT (같은 ATTEMPT_NO)
 * - ATTEMPT_NO로 그룹핑하여 "첫 제출 vs 최종 제출" 비교 가능
 */
@Entity
@Table(
    name = "LRN_SUBM",
    indexes = {
        @Index(name = "IDX_LRN_SUBM_LRN_ATT", columnList = "LRN_ID, ATTEMPT_NO"),
        @Index(name = "IDX_LRN_SUBM_LRN_BLANK", columnList = "LRN_ID, BLANK_ID")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class LrnSubm {

    /** 제출 PK (AUTO_INCREMENT) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LRN_SUBM_ID")
    private Long lrnSubmId;

    /** 소속 학습 세션 (LRN FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LRN_ID", nullable = false)
    private Lrn lrn;

    /** 대상 빈칸 (BLANK FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BLANK_ID", nullable = false)
    private Blank blank;

    /** 사용자가 입력한 답안 */
    @Lob
    @Column(name = "USER_ANS", columnDefinition = "LONGTEXT", nullable = false)
    private String userAns;

    /** 정답 여부 (Y: 정답 / N: 오답) */
    @Column(name = "IS_CORRECT", length = 1, nullable = false)
    private String isCorrect;

    /** 사용한 힌트 단계 (0: 안 봄 / 1~3) */
    @Column(name = "HINT_USED_LV", nullable = false)
    @Builder.Default
    private Integer hintUsedLv = 0;

    /**
     * 시도 차수 (1부터 시작)
     * - 같은 ATTEMPT_NO를 가진 LRN_SUBM 행들 = 그 시점의 전체 답안 스냅샷
     */
    @Column(name = "ATTEMPT_NO", nullable = false)
    private Integer attemptNo;

    /**
     * 채점 방식 (S: 문자열 일치 / A: AI 의미 비교)
     * - 통계/디버깅용. 문자열로 통과했는지 AI 폴백으로 통과했는지 추적
     */
    @Column(name = "GRD_METHOD", length = 1)
    private String grdMethod;

    /** 제출 일시 */
    @Column(name = "SUBM_AT", nullable = false, updatable = false)
    private LocalDateTime submAt;

    @PrePersist
    protected void onCreate() {
        if (submAt == null) submAt = LocalDateTime.now();
    }
}