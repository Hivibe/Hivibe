package com.hivibe.server.domain.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 개별 빈칸 엔티티
 * - 빈칸 세트(BLANK_SET) 내 개별 빈칸의 정답과 단계별 힌트를 저장
 * - CONCEPT와 연결되어 "이 빈칸은 어떤 개념을 학습시키는지" 표현
 */
@Entity
@Table(name = "BLANK")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Blank {

    /** 빈칸 PK (AUTO_INCREMENT) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BLANK_ID")
    private Long blankId;

    /** 소속 빈칸 세트 (BLANK_SET FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BLANK_SET_ID", nullable = false)
    private BlankSet blankSet;

    /**
     * 연결된 개념 (CONCEPT FK, nullable)
     * - "지금 풀고 있는 빈칸이 어떤 개념을 학습시키는지" 매핑
     * - 학습 화면에서 빈칸 클릭 시 해당 개념 강조 표시
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONC_ID", nullable = true)
    private Concept concept;

    /**
     * 빈칸 키 (예: BLANK_1, BLANK_2)
     * - TEMPLATE_CODE 내 {{BLANK_1}} 마커와 매칭
     */
    @Column(name = "BLANK_KEY", length = 20, nullable = false)
    private String blankKey;

    /** 화면 표시 순서 (낮을수록 먼저 표시) */
    @Column(name = "BLANK_ORD", nullable = false)
    private Integer blankOrd;

    /** 정답 코드 조각 */
    @Lob
    @Column(name = "EXP_ANS", columnDefinition = "LONGTEXT", nullable = false)
    private String expAns;

    /** 1단계 힌트 (개념 수준의 넓은 힌트) */
    @Lob
    @Column(name = "HINT_LV1", columnDefinition = "LONGTEXT")
    private String hintLv1;

    /** 2단계 힌트 (구체적 힌트) */
    @Lob
    @Column(name = "HINT_LV2", columnDefinition = "LONGTEXT")
    private String hintLv2;

    /** 3단계 힌트 (거의 정답에 가까운 힌트) */
    @Lob
    @Column(name = "HINT_LV3", columnDefinition = "LONGTEXT")
    private String hintLv3;

    /** 양방향 편의 메서드 */
    public void assignBlankSet(BlankSet blankSet) {
        this.blankSet = blankSet;
    }
}