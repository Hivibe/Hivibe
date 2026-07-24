package com.hivibe.server.domain.entity;

import com.hivibe.server.domain.enums.RvwStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "rvw_sched",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_rvw_sched",
                columnNames = {"lrn_id", "stage"}
        ),
        indexes = {
                @Index(name = "idx_rvw_due", columnList = "due_date, status"),
                @Index(name = "idx_rvw_user", columnList = "user_id, status")
        }
)
public class RvwSched {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rvw_sched_id")
    private Long rvwSchedId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lrn_id", nullable = false,
            foreignKey = @jakarta.persistence.ForeignKey(name = "fk_rvw_sched_lrn"))
    private Lrn lrn;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @jakarta.persistence.ForeignKey(name = "fk_rvw_sched_user"))
    private User user;

    @Column(name = "stage", nullable = false)
    private int stage;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RvwStatus status;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public static RvwSched of(Lrn lrn, User user, int stage, LocalDate dueDate) {
        RvwSched s = new RvwSched();
        s.lrn = lrn;
        s.user = user;
        s.stage = stage;
        s.dueDate = dueDate;
        s.status = RvwStatus.PENDING;
        return s;
    }

    @PrePersist
    void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = RvwStatus.PENDING;
        }
    }

    public void markSent() {
        this.status = RvwStatus.SENT;
        this.sentAt = LocalDateTime.now();
    }

    public void markCompleted() {
        this.status = RvwStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    public void skip() {
        this.status = RvwStatus.SKIPPED;
    }

    public boolean isOwnedBy(Long userId) {
        return this.user != null && this.user.getId().equals(userId);
    }
}