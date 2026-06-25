package com.hivibe.server.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 빈칸 세트 엔티티
 * - 하나의 OptCd에 대해 난이도별로 빈칸이 박힌 학습용 코드를 저장
 * - 흐름: OPT_CD → BLANK_SET (난이도별) → BLANK (세트 내 빈칸들)
 * - 같은 OPT_CD + DIFFICULTY 조합은 1개만 존재 (캐싱)
 */
@Entity
@Table(
    name = "BLANK_SET",
    uniqueConstraints = {
        @UniqueConstraint(name = "UK_BLANK_SET_OPT_DIFF", columnNames = {"OPT_CD_ID", "DIFFICULTY"})
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class BlankSet {

    /** 빈칸 세트 PK (AUTO_INCREMENT) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BLANK_SET_ID")
    private Long blankSetId;

    /** 빈칸 세트가 속한 최적화 코드 (OPT_CD FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OPT_CD_ID", nullable = false)
    private OptCd optCd;

    /** 난이도 (E: Easy / M: Medium / H: Hard) */
    @Column(name = "DIFFICULTY", length = 1, nullable = false)
    private String difficulty;

    /**
     * 빈칸 마커가 박힌 학습용 코드
     * - 마커 컨벤션: {{BLANK_1}}, {{BLANK_2}} ...
     * - 언어 무관 (Java/Python/JS 모두 안전)
     */
    @Lob
    @Column(name = "TEMPLATE_CODE", columnDefinition = "LONGTEXT", nullable = false)
    private String templateCode;

    /** 생성 일시 (변경 불가) */
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** 이 세트에 속한 빈칸들 (양방향) */
    @OneToMany(mappedBy = "blankSet", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Blank> blanks = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    /** 양방향 편의 메서드 */
    public void addBlank(Blank blank) {
        this.blanks.add(blank);
        blank.assignBlankSet(this);
    }
}