package com.hivibe.server.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 오리지널 코드 엔티티
 * - 사용자가 입력한 원본 코드를 저장
 * - 전체 흐름의 시작점: ORN_CD → ANLS → OPT_CD → LRN
 */
@Entity
@Table(name = "ORN_CD")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class OrnCd {

    /** 오리지널 코드 PK (AUTO_INCREMENT) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ORN_CD_ID")
    private Long ornCdId;

    /** 코드를 입력한 사용자 (USER FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = true)
    private User user;

    /** 코드 제목 (사용자가 직접 입력) */
    @Column(name = "CD_NAME", length = 100)
    private String cdName;

    /** 프로그래밍 언어 (예: Java, Python) */
    @Column(name = "LANG", length = 10, nullable = false)
    private String lang;

    /** 분석 가능 여부 (Y: 분석 가능 / N: 코드가 너무 짧거나 분석 불가) */
    @Column(name = "STBLT_YN", length = 1, nullable = false)
    private String stbltYn;

    /** 실제 코드 내용 */
    @Column(name = "CD_CN", columnDefinition = "TEXT")
    private String cdCn;

    /** 코드 등록 일시 (최초 생성 후 변경 불가) */
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