package com.hivibe.server.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 뱃지 엔티티
 * - 사용자가 특정 조건(진단 횟수, 점수, 노트 개수 등)을 만족하면 지급되는 업적
 */
@Entity
@Table(name = "BADGE",
    uniqueConstraints = @UniqueConstraint(columnNames = {"USER_ID", "BADGE_KEY"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BADGE_ID")
    private Long badgeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "BADGE_KEY", nullable = false, length = 50)
    private String badgeKey;

    @Column(name = "ACHIEVED_AT", nullable = false, updatable = false)
    private LocalDateTime achievedAt;

    @PrePersist
    protected void onCreate() {
        if (achievedAt == null) achievedAt = LocalDateTime.now();
    }
}