package com.hivibe.server.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 학습 빈칸 엔티티
 * - LRN 하나당 N개의 빈칸 (OptCd.blank의 {{BLANK_N}} 마커와 1:1 대응)
 * - BLANK_ORD = 마커의 N (1부터 시작)
 */
@Entity
@Table(name = "LRN_BLANK")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class LrnBlank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BLANK_ID")
    private Long blankId;

    /** 이 빈칸이 속한 학습 세션 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LRN_ID", nullable = false)
    private Lrn lrn;

    /** 빈칸 순번 ({{BLANK_N}}의 N, 1부터) */
    @Column(name = "BLANK_ORD", nullable = false)
    private Integer blankOrd;

    /** 기대 정답 (최적화 코드에서 뚫린 부분의 원본 텍스트) */
    @Column(name = "EXP_ANS", length = 500, nullable = false)
    private String expAns;

    /** 이 빈칸과 연결된 개념 (힌트용, nullable) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONC_ID")
    private Concept concept;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}