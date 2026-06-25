package com.hivibe.server.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 개념 엔티티
 * - 학습(LRN) 과정에서 AI가 추출하거나 사용자가 정리한 핵심 개념
 * - 원본 코드 기준 개념(O)과 최적화 코드 기준 개념(P)을 구분
 */
@Entity
@Table(name = "CONCEPT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Concept {

    /** 개념 PK (AUTO_INCREMENT) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CONC_ID")
    private Long concId;

    /** 개념이 속한 학습 세션 (LRN FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LRN_ID", nullable = false)
    private Lrn lrn;

    /** 코드 기준 타입 (O: 오리지널 코드 기준 / P: 최적화 코드 기준) */
    @Column(name = "CD_TYPE", length = 1, nullable = false)
    private String cdType;

    /** 개념 제목 (예: HashMap, 버블 정렬, DFS) */
    @Column(name = "CONC_TITLE", length = 200, nullable = false)
    private String concTitle;

    /** 개념 상세 설명 */
    @Lob
    @Column(name = "CONC_DESC", columnDefinition = "LONGTEXT")
    private String concDesc;

    /** 참고 URL (공식 문서, 블로그 등) */
    @Column(name = "REF_URL", length = 500)
    private String refUrl;

    /** 화면 표시 순서 (낮을수록 먼저 표시) */
    @Column(name = "SORT_ORD")
    private Integer sortOrd;

    /** 개념 생성 일시 (최초 생성 후 변경 불가) */
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * INSERT 직전 실행
     * createdAt 이 null 이면 현재 시간으로 자동 세팅
     */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}