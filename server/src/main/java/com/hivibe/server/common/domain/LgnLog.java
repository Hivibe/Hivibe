package com.hivibe.server.common.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "LGN_LOG", indexes = {
    @Index(name = "idx_lgn_log_lgn_id", columnList = "LGN_ID")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class LgnLog {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LGN_HISTORY_ID")
    private Long lgnHistoryId;
 
    @Column(name = "LGN_ID", length = 20, nullable = false)
    private String lgnId;              // USER.LGN_ID 논리 참조 (VARCHAR라 FK 미설정)
 
    @Lob
    @Column(name = "REFRESH_TOKEN")
    private String refreshToken;
 
    @Lob
    @Column(name = "ACCESS_TOKEN")
    private String accessToken;
 
    @Column(name = "ISSUED_AT", nullable = false, updatable = false)
    private LocalDateTime issuedAt;
 
    @Column(name = "EXPIRES_AT", nullable = false)
    private LocalDateTime expiresAt;
 
    @Column(name = "LAST_USED_DT")
    private LocalDateTime lastUsedDt;
 
    @Column(name = "IS_CURRENT", length = 1, nullable = false)
    @Builder.Default
    private String isCurrent = "Y";    // 로그인:Y / 로그아웃·만료:N
 
    @PrePersist
    protected void onCreate() {
        if (issuedAt == null) issuedAt = LocalDateTime.now();
    }
}
 