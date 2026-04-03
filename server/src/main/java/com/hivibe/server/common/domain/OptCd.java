package com.hivibe.server.common.domain;

import jakarta.persistence.*;
import lombok.*;

/**
 * 최적화 코드 엔티티
 * - AI가 분석(ANLS) 결과를 바탕으로 생성한 최적화된 코드
 * - 이 코드를 기반으로 학습(LRN)이 시작됨
 * - 흐름: ANLS → OPT_CD → LRN
 */
@Entity
@Table(name = "OPT_CD")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class OptCd {

    /** 최적화 코드 PK (AUTO_INCREMENT) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OPT_CD_ID")
    private Long optCdId;

    /** 최적화의 근거가 된 분석 결과 (ANLS FK, 1:1 관계) */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ANLS_ID", nullable = false)
    private Anls anls;

    /** 프로그래밍 언어 (예: Java, Python) */
    @Column(name = "LANG", length = 50, nullable = false)
    private String lang;

    /** 빈칸 채우기 학습용 코드 (특정 부분을 blank 처리한 버전) */
    @Lob
    @Column(name = "BLANK")
    private String blank;

    /** 최적화된 전체 코드 내용 */
    @Lob
    @Column(name = "CD_CN", nullable = false)
    private String cdCn;

    /** 최적화 코드의 시간복잡도 (예: O(n log n)) */
    @Column(name = "TIME_COMP", length = 10)
    private String timeComp;
}