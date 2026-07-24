package com.hivibe.server.review.dto;

import com.hivibe.server.domain.entity.RvwSched;
import com.hivibe.server.domain.enums.RvwStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReviewResponseDto(
        Long schedId,
        Long lrnId,
        String lrnName,
        int stage,
        String stageLabel,
        LocalDate dueDate,
        RvwStatus status,
        LocalDateTime sentAt,
        boolean overdue
) {
    private static final String[] STAGE_LABELS = {
            "1일 차 복습", "3일 차 복습", "7일 차 복습", "14일 차 복습", "30일 차 복습"
    };

    public static String stageLabelOf(int stage) {
        return (stage >= 0 && stage < STAGE_LABELS.length)
                ? STAGE_LABELS[stage]
                : (stage + 1) + "단계 복습";
    }

    public static ReviewResponseDto from(RvwSched s) {
        return new ReviewResponseDto(
                s.getRvwSchedId(),
                s.getLrn().getLrnId(),
                s.getLrn().getLrnName(),
                s.getStage(),
                stageLabelOf(s.getStage()),
                s.getDueDate(),
                s.getStatus(),
                s.getSentAt(),
                s.getDueDate().isBefore(LocalDate.now())
        );
    }
}