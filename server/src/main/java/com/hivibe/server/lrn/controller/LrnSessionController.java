package com.hivibe.server.lrn.controller;

import com.hivibe.server.domain.entity.User;
import com.hivibe.server.lrn.dto.*;
import com.hivibe.server.lrn.service.LrnGradingService;
import com.hivibe.server.lrn.service.LrnSessionService;
import com.hivibe.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/learning/sessions")
@RequiredArgsConstructor
public class LrnSessionController {

    private final LrnSessionService sessionService;
    private final LrnGradingService gradingService;
    private final UserRepository userRepository;

    /**
     * 학습 세션 시작 (빈칸 생성 + Lrn 생성)
     */
    @PostMapping
    public ResponseEntity<SessionResponseDto> startSession(
        @RequestBody SessionCreateRequestDto request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByLgnId(userDetails.getUsername())
            .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));
        return ResponseEntity.ok(sessionService.startSession(request, user));
    }

    /**
     * 학습 세션 답안 제출 (채점 + 진행률 갱신)
     */
    @PostMapping("/{lrnId}/submissions")
    public ResponseEntity<SubmissionResponseDto> submit(
        @PathVariable Long lrnId,
        @RequestBody SubmissionRequestDto request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByLgnId(userDetails.getUsername())
            .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));
        return ResponseEntity.ok(gradingService.submit(lrnId, request, user));
    }
}