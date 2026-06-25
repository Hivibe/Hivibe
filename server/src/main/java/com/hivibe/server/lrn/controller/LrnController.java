package com.hivibe.server.lrn.controller;

import com.hivibe.server.domain.entity.User;
import com.hivibe.server.lrn.dto.*;
import com.hivibe.server.lrn.service.AiLearningService;
import com.hivibe.server.lrn.service.LearningSaveService;
import com.hivibe.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class LrnController {

    private final AiLearningService aiLearningService;
    private final LearningSaveService learningSaveService;   // ← LrnSessionService → LearningSaveService
    private final UserRepository userRepository;

    /** AI 학습 생성 (DB 저장 X, 순수 Gemini 호출) */
    @PostMapping("/api/v1/ai/learning")
    public ResponseEntity<AiLearningResponseDto> generateAiLearning(
        @RequestBody AiLearningRequestDto request
    ) {
        log.info("[AI LEARNING] diagnosisId={}", request.diagnosisId());
        AiLearningResponseDto response = aiLearningService.generate(request);
        return ResponseEntity.ok(response);
    }

    /** 학습 세션 저장 */
    @PostMapping("/api/v1/learnings")
    public ResponseEntity<Map<String, Object>> saveLearning(
        @RequestBody LearningSaveRequestDto request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("[LEARNING SAVE] diagnosisId={}, user={}",
            request.diagnosisId(),
            userDetails != null ? userDetails.getUsername() : "null");

        if (userDetails == null) {
            throw new IllegalStateException("인증 정보가 없습니다.");
        }

        User user = userRepository.findByLgnId(userDetails.getUsername())
            .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));

        Long lrnId = learningSaveService.save(request, user);
        return ResponseEntity.ok(Map.of(
            "message", "학습 세션 생성 완료",
            "id", lrnId
        ));
    }
}