package com.hivibe.server.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 노트 엔티티
 * - 사용자가 최적화 코드(OPT_CD)를 학습하면서 작성한 메모/노트
 * - 코드 스냅샷, 태그, 카테고리, 즐겨찾기 기능 제공
 */
@Entity
@Table(name = "NOTE")
@Getter
@Setter  // ← 추가
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Note {

    /** 노트 PK (AUTO_INCREMENT) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NOTE_ID")
    private Long noteId;

    /** 노트를 작성한 사용자 (USER FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    /** 노트의 기반이 되는 최적화 코드 (OPT_CD FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    // 2026-06-15 변경 사항
    @JoinColumn(name = "OPT_CD_ID", nullable = true)
    private OptCd optCd;

    /** 노트 제목 */
    @Column(name = "NOTE_NAME", length = 100)
    private String noteName;

    /** 노트 메모 (자유 형식 텍스트) */
    @Lob
    @Column(name = "NOTE_MEMO")
    private String noteMemo;

    /** 코드 스냅샷 블록 (특정 시점의 코드를 저장) */
    @Lob
    @Column(name = "NOTE_CN")
    private String noteCn;

    /** 즐겨찾기 여부 (Y: 즐겨찾기 / N: 일반) */
    @Column(name = "BKMK_YN", length = 1, nullable = false)
    @Builder.Default
    private String bkmkYn = "N";

    /** 태그 (예: #DP, #Graph) */
    @Column(name = "TAG", length = 200)
    private String tag;

    /** 카테고리 (예: GRAPH, SORT) */
    @Column(name = "CATEGORY", length = 50)
    private String category;

    /** 사용 언어 (예: Java, Python) */
    @Column(name = "LANG", length = 50)
    private String lang;

    /** 노트 생성 일시 (최초 생성 후 변경 불가) */
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