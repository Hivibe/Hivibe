package com.hivibe.server.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 학습 제출 이력 엔티티
 * - 빈칸 하나에 대한 한 번의 제출 기록
 * - ATTEMPT_NO로 재시도 차수 구분
 */
@Entity
@Table(name = "LRN_SUBM")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class LrnSubm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SUBM_ID")
    private Long submId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LRN_ID", nullable = false)
    private Lrn lrn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BLANK_ID", nullable = false)
    private LrnBlank blank;

    /** 시도 차수 (Lrn.lastAttemptNo + 1) */
    @Column(name = "ATTEMPT_NO", nullable = false)
    private Integer attemptNo;

    /** 사용자가 입력한 답 */
    @Column(name = "USER_ANS", length = 500, nullable = false)
    private String userAns;

    /** 정답 여부 (Y/N) */
    @Column(name = "IS_CORRECT", length = 1, nullable = false)
    private String isCorrect;

    /** 채점 방식 (S: 문자열일치 / A: AI의미일치 / N: 오답) */
    @Column(name = "GRD_METHOD", length = 1, nullable = false)
    private String grdMethod;

    /** 사용한 힌트 레벨 (0=미사용, 1~3) */
    @Column(name = "HINT_USED_LV", nullable = false)
    @Builder.Default
    private Integer hintUsedLv = 0;

    /** 정답과의 차이점 설명 (AI 채점 시) */
    @Lob
    @Column(name = "DIFF_NOTE", columnDefinition = "LONGTEXT")
    private String diffNote;

    /** 개선 추천사항 */
    @Lob
    @Column(name = "RECOMMEND", columnDefinition = "LONGTEXT")
    private String recommend;

    /** 보안/안정성 관련 지적사항 */
    @Lob
    @Column(name = "SECURITY_NOTE", columnDefinition = "LONGTEXT")
    private String securityNote;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    /** 정답 공개로 해제됐는지 여부 (Y/N) — 자력 해제와 구분용 */
    @Column(name = "REVEALED_YN", length = 1, nullable = false)
    @Builder.Default
    private String revealedYn = "N";
}