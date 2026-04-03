package com.hivibe.server.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 학습 엔티티
 * - 최적화 코드(OPT_CD)를 기반으로 생성된 학습 세션
 * - 원본 코드(ORN_CD)도 직접 참조하여 비교 학습에 활용
 * - 흐름: OPT_CD → LRN → CONCEPT
 */
@Entity
@Table(name = "LRN")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Lrn {

    /** 학습 PK (AUTO_INCREMENT) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LRN_ID")
    private Long lrnId;

    /** 학습을 진행하는 사용자 (USER FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    /** 학습의 기반이 되는 최적화 코드 (OPT_CD FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OPT_CD_ID", nullable = false)
    private OptCd optCd;

    /**
     * 원본 코드 직접 참조 (ORN_CD FK)
     * OPT_CD → ANLS → ORN_CD 로 역추적 가능하지만,
     * 학습 화면에서 원본 코드를 바로 조회하기 위해 직접 참조
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORN_CD_ID", nullable = false)
    private OrnCd ornCd;

    /** 학습 제목 (사용자가 직접 입력) */
    @Column(name = "LRN_NAME", length = 100)
    private String lrnName;

    /** 즐겨찾기 여부 (Y: 즐겨찾기 / N: 일반) */
    @Column(name = "BKMK_YN", length = 1, nullable = false)
    @Builder.Default
    private String bkmkYn = "N";

    /** 태그 (예: #DP, #Graph, #BinarySearch) */
    @Column(name = "TAG", length = 200)
    private String tag;

    /** 학습 생성 일시 (최초 생성 후 변경 불가) */
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** 학습 생성 일시 (최초 생성 후 변경 불가) */
    @Column(name = "GRADE", length = 5)
    private String grade;

    /**
     * INSERT 직전 실행
     * createdAt 이 null 이면 현재 시간으로 자동 세팅
     */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}