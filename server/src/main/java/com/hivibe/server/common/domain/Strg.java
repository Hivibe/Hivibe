package com.hivibe.server.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * 저장 엔티티
 * - 학습(LRN), 진단(DGNS), 노트(NOTE) 이력을 통합 관리하는 저장소
 * - STRG_TYPE 으로 어떤 종류의 저장인지 구분
 */
@Entity
@Table(name = "STRG")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Strg {

    /** 저장 PK (AUTO_INCREMENT) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "STRG_ID")
    private Long strgId;

    /** 저장한 사용자 (USER FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    /** 연결된 학습 세션 (LRN FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LRN_ID", nullable = false)
    private Lrn lrn;

    /** 연결된 진단 (DGNS FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DGNS_ID", nullable = false)
    private Dgns dgns;

    /** 연결된 노트 (NOTE FK, 선택적 — 노트가 없는 경우 null 허용) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "NOTE_ID")
    private Note note;

    /** 저장 타입 (D: 진단 / L: 학습 / N: 노트) */
    @Column(name = "STRG_TYPE", length = 1, nullable = false)
    private String strgType;

    /** 저장 일자 */
    @Column(name = "CREATED_AT", nullable = false)
    private LocalDate createdAt;

    /** 태그 (예: #DP, #Graph) */
    @Column(name = "TAG", length = 200)
    private String tag;

    /** 저장 설명 (사용자가 직접 입력하는 메모) */
    @Lob
    @Column(name = "EXPLN")
    private String expln;
}