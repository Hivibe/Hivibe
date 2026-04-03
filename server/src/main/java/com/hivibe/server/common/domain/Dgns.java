package com.hivibe.server.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 진단 엔티티
 * - 분석(ANLS) 결과를 기반으로 생성된 사용자의 코드 진단 이력
 * - 사용자는 진단을 통해 자신의 코드 수준을 확인
 */
@Entity
@Table(name = "DGNS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Dgns {

    /** 진단 PK (AUTO_INCREMENT) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DGNS_ID")
    private Long dgnsId;

    /** 진단을 받은 사용자 (USER FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    /** 진단의 근거가 된 분석 결과 (ANLS FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ANLS_ID", nullable = false)
    private Anls anls;

    /** 진단명 (예: 알고리즘 효율성 진단) */
    @Column(name = "DGNS_NM", length = 20)
    private String dgnsNm;

    /** 진단 일시 (최초 생성 후 변경 불가) */
    @Column(name = "DGNS_DT", nullable = false, updatable = false)
    private LocalDateTime dgnsDt;

    /**
     * INSERT 직전 실행
     * dgnsDt 가 null 이면 현재 시간으로 자동 세팅
     */
    @PrePersist
    protected void onCreate() {
        if (dgnsDt == null) dgnsDt = LocalDateTime.now();
    }
}
