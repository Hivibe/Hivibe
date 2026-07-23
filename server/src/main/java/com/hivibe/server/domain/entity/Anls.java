package com.hivibe.server.domain.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 분석 엔티티
 * - AI가 원본 코드(ORN_CD)를 분석한 결과를 저장
 * - 등급, 점수, 효율성/가독성/스타일 및 각 항목의 판단 근거를 포함
 * - 흐름: ORN_CD → ANLS → OPT_CD
 *
 * 컬럼 타입 정책:
 * - AI가 생성하는 자연어 필드는 모두 TEXT (약 65,535 byte)
 *   utf8mb4 기준 한글 약 16,000자까지 저장 가능
 * - 과거 TINYTEXT(255 byte ≒ 한글 85자)로 인한 Data truncation 오류가 반복되어 일괄 확장함
 * - @Lob은 사용하지 않음: Hibernate 6에서 드라이버에 따라 CLOB 처리로 빠지는 경우가 있어
 *   columnDefinition으로 명시하는 편이 예측 가능함
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

    /** 코드 등급 (S / A / B / C / F) — 점수 구간에서 파생, 프론트 getGradeFromScore와 동일 기준 */
    @Column(name = "CD_GRD", length = 10)
    private String cdGrd;

    /** 코드 총점 (0 ~ 100) */
    @Column(name = "CD_SCR")
    private Integer cdScr;

    /**
     * 효율성 점수
     * TODO: 프론트에서 숫자(0~100)를 보내는데 String으로 받고 있음.
     *       통계/정렬 기능 추가 시 Integer + INT로 전환 필요
     */
    @Column(name = "CD_EFCN", columnDefinition = "TEXT")
    private String cdEfcn;

    /** 가독성 점수 — cdEfcn과 동일한 타입 이슈 있음 */
    @Column(name = "CD_READ", columnDefinition = "TEXT")
    private String cdRead;

    /**
     * 스타일 점수 — cdEfcn과 동일한 타입 이슈 있음
     * 주의: 컬럼명 SYTLE은 STYLE의 오타. 엔티티/DTO/프론트 전반에서 사용 중이라 유지함
     */
    @Column(name = "CD_SYTLE", columnDefinition = "TEXT")
    private String cdSytle;

    /**
     * 시간복잡도 (원본 코드 기준)
     * 예: "O(n)", "O(n log n)"
     * AI가 "O(n log n) — 정렬이 지배적, 공간은 O(n)" 처럼 설명을 덧붙이는 경우가 있어 TEXT 사용
     */
    @Column(name = "TIME_COMP", columnDefinition = "TEXT")
    private String timeComp;

    /** 정확성 판단 근거 (AI 생성 자연어) */
    @Column(name = "CD_ACC_RSN", columnDefinition = "TEXT")
    private String cdAccRsn;

    /** 효율성 판단 근거 (AI 생성 자연어) */
    @Column(name = "CD_EFCN_RSN", columnDefinition = "TEXT")
    private String cdEfcnRsn;

    /** 가독성 판단 근거 (AI 생성 자연어) */
    @Column(name = "CD_READ_RSN", columnDefinition = "TEXT")
    private String cdReadRsn;

    /** 스타일 판단 근거 (AI 생성 자연어) */
    @Column(name = "CD_STYLE_RSN", columnDefinition = "TEXT")
    private String cdStyleRsn;

    /** AI 분석 요약 — 진단 패널 상단에 표시되는 전체 총평 */
    @Column(name = "AI_SUMMRY", columnDefinition = "TEXT")
    private String aiSummry;
}