package com.hivibe.server.badge.controller;

import com.hivibe.server.badge.dto.BadgeResponseDto;
import com.hivibe.server.badge.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BadgeController {

    private final BadgeService badgeService;

    // 임시 lgnId — 팀원 JWT 머지 후 SecurityContext로 교체
    private String getCurrentLgnId() {
        return "cherry123";
    }

    /** 뱃지 목록 조회 (획득 + 미획득) */
    @GetMapping
    public ResponseEntity<List<BadgeResponseDto>> getBadges() {
        return ResponseEntity.ok(badgeService.getBadges(getCurrentLgnId()));
    }

    /** 뱃지 조건 체크 및 신규 지급 (진단/노트 저장 직후 호출) */
    @PostMapping("/check")
    public ResponseEntity<List<BadgeResponseDto>> checkBadges() {
        return ResponseEntity.ok(badgeService.checkAndAward(getCurrentLgnId()));
    }
}