package com.hivibe.server.domain.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * AI 코칭 설정 엔티티
 * - 사용자별 AI 코칭 기능 ON/OFF 여부를 관리
 * - USER 와 1:1 관계
 */
@Entity
@Table(name = "AI_COACHING")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AiCoaching {

    /** AI 코칭 설정 PK (AUTO_INCREMENT) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "COAH_ID")
    private Long coahId;

    /** 설정 대상 사용자 (USER FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    /** AI 코칭 활성화 여부 (Y: ON / N: OFF) */
    @Column(name = "COAH_YN", length = 1, nullable = false)
    @Builder.Default
    private String coahYn = "N";
}