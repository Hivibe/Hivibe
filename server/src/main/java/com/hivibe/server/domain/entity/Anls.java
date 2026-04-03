package com.hivibe.server.domain.entity;


import jakarta.persistence.*;
import lombok.*;

/**
 * 분석 엔티티
 * - AI가 원본 코드(ORN_CD)를 분석한 결과를 저장
 * - 등급, 점수, 효율성/가독성/스타일/위험요소 등을 포함
 * - 흐름: ORN_CD → ANLS → OPT_CD
 */
@Entity
@Table(name = "ANLS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Anls {

    /** 분석 PK (AUTO_INCREMENT) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ANLS_ID")
    private Long anlsId;

    /** 분석 대상 원본 코드 (ORN_CD FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORN_CD_ID", nullable = true) // 임시로 true
    private OrnCd ornCd;

    /** 코드 등급 (S / A / B / C) */
    @Column(name = "CD_GRD", length = 10)
    private String cdGrd;

    /** 코드 점수 (0 ~ 100) */
    @Column(name = "CD_SCR")
    private Integer cdScr;

    /** 효율성 분석 결과 */
    @Lob
    @Column(name = "CD_EFCN")
    private String cdEfcn;

    /** 가독성 분석 결과 */
    @Lob
    @Column(name = "CD_READ")
    private String cdRead;

    /** 스타일 분석 결과 */
    @Lob
    @Column(name = "CD_SYTLE")
    private String cdSytle;

    /** 시간복잡도 (오리지널 코드 기준, 예: O(n), O(log n)) */
    @Column(name = "TIME_COMP", length = 10)
    private String timeComp;

    /** 효율성이유 */
    @Lob
    @Column(name = "CD_EFCN_RSN")
    private String cdEfcnRsn;

    /*정확성이유 */
    @Lob
    @Column(name = "CD_ACC_RSN")
    private String cdAccRsn;

    /** 가독성이유 */
    @Lob
    @Column(name = "CD_READ_RSN")
    private String cdReadRsn;

    /** 스타일이유 */
    @Lob
    @Column(name = "CD_STYLE_RSN")
    private String cdStyleRsn;

    /**AI 분석 요약 */
    @Lob
    @Column(name = "AI_SUMMRY", columnDefinition = "TEXT")
    private String aiSummry;
}