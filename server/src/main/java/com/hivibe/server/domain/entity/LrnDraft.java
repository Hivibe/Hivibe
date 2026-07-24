package com.hivibe.server.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 학습 임시 답안(draft) 엔티티
 * - 사용자가 입력 중인 빈칸 답을 자동 저장 (제출/채점과는 무관)
 * - 학습 1건당 1행만 유지 (LRN_ID UNIQUE, upsert 방식)
 * - 목적: 뒤로가기/새로고침/기기 변경 시에도 입력 중이던 답 복원
 */
@Entity
@Table(
    name = "LRN_DRAFT",
    uniqueConstraints = @UniqueConstraint(name = "UK_LRN_DRAFT_LRN", columnNames = "LRN_ID")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class LrnDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LRN_DRAFT_ID")
    private Long lrnDraftId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LRN_ID", nullable = false)
    private Lrn lrn;

    /**
     * 빈칸 답안 JSON
     * 형식: {"1":"map.get(x)", "2":"n log n"}
     * key = blankOrd(빈칸 순번), value = 사용자 입력값
     */
    @Column(name = "ANSWERS", columnDefinition = "LONGTEXT")
    private String answers;

    @Column(name = "UPDATED_AT", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = LocalDateTime.now();
    }

    /** 답안 갱신 (upsert 시 기존 행 재사용) */
    public void updateAnswers(String answers) {
        this.answers = answers;
    }
}