package com.hivibe.server.review.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hivibe.server.review.scheduler.RvwSchedJob;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Profile("dev")
@RestController
@RequestMapping("/api/v1/dev/reviews")
@RequiredArgsConstructor
public class RvwTestController {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    private final RvwSchedJob rvwSchedJob;

    /**
     * 복습 메일 즉시 발송.
     * hour 미지정 시 현재 시각 기준.
     * 예) POST /api/v1/dev/reviews/dispatch?hour=9
     */
    @PostMapping("/dispatch")
    public ResponseEntity<String> dispatchNow(
            @RequestParam(required = false) Integer hour) {
        LocalDateTime now = LocalDateTime.now(KST);
        LocalDate today = now.toLocalDate();
        int targetHour = (hour == null) ? now.getHour() : hour;

        int sent = rvwSchedJob.dispatch(today, targetHour);
        return ResponseEntity.ok("발송 " + sent + "건 (date=" + today + ", hour=" + targetHour + ")");
    }
}