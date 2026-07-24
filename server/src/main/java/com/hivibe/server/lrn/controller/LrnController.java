package com.hivibe.server.lrn.controller;

import com.hivibe.server.domain.entity.User;
import com.hivibe.server.lrn.dto.*;
import com.hivibe.server.lrn.service.AiLearningService;
import com.hivibe.server.lrn.service.LearningQueryService;
import com.hivibe.server.lrn.service.LearningSaveService;
import com.hivibe.server.lrn.service.LrnDraftService;
import com.hivibe.server.lrn.service.LrnGradingService;
import com.hivibe.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.hivibe.server.lrn.service.LrnHintService;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class LrnController {

    private final AiLearningService aiLearningService;
    private final LearningSaveService learningSaveService;   // ← LrnSessionService → LearningSaveService
    private final UserRepository userRepository;
    private final LrnGradingService lrnGradingService;
    private final LearningQueryService learningQueryService;
    private final LrnHintService lrnHintService;
    private final LrnDraftService lrnDraftService;

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
    public ResponseEntity<LearningSaveResponseDto> saveLearning(
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

        return ResponseEntity.ok(learningSaveService.save(request, user));
    }

/**
     * 학습 채점
     * POST /api/v1/learnings/{lrnId}/submissions
     * - 모든 빈칸을 한 번에 제출
     * - 문자열 일치 → 실패 시 AI 의미 비교 폴백
     */
    @PostMapping("/api/v1/learnings/{lrnId}/submissions")
    public ResponseEntity<SubmissionResponseDto> submit(
        @PathVariable("lrnId") Long lrnId,
        @RequestBody SubmissionRequestDto request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new IllegalStateException("인증 정보가 없습니다.");
        }
        User user = userRepository.findByLgnId(userDetails.getUsername())
            .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));

        return ResponseEntity.ok(lrnGradingService.submit(lrnId, request, user));
    }

    /**
     * 아카이브 목록 조회
     * GET /api/v1/learnings
     */
    @GetMapping("/api/v1/learnings")
    public ResponseEntity<List<LearningListItemDto>> listLearnings(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = currentUser(userDetails);
        return ResponseEntity.ok(learningQueryService.findAll(user));
    }

    /**
     * 학습 상세 조회
     * GET /api/v1/learnings/{lrnId}
     */
    @GetMapping("/api/v1/learnings/{lrnId}")
    public ResponseEntity<LearningDetailResponseDto> getLearning(
        @PathVariable("lrnId") Long lrnId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = currentUser(userDetails);
        return ResponseEntity.ok(learningQueryService.findDetail(lrnId, user));
    }

    /**
     * 즐겨찾기 토글
     * PATCH /api/v1/learnings/{lrnId}/bookmark
     */
    @PatchMapping("/api/v1/learnings/{lrnId}/bookmark")
    public ResponseEntity<Map<String, Boolean>> toggleBookmark(
        @PathVariable("lrnId") Long lrnId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = currentUser(userDetails);
        boolean bookmarked = learningQueryService.toggleBookmark(lrnId, user);
        return ResponseEntity.ok(Map.of("bookmarked", bookmarked));
    }

    // ─────────── 내부 ───────────

    private User currentUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("인증 정보가 없습니다.");
        }
        return userRepository.findByLgnId(userDetails.getUsername())
            .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));
    }

    /**
     * 학습 세션 삭제
     * DELETE /api/v1/learnings/{lrnId}
     */
    @DeleteMapping("/api/v1/learnings/{lrnId}")
    public ResponseEntity<Void> deleteLearning(
        @PathVariable("lrnId") Long lrnId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = currentUser(userDetails);
        learningQueryService.delete(lrnId, user);
        return ResponseEntity.noContent().build();
    }

    /**
     * 마지막 채점 결과 조회
     * GET /api/v1/learnings/{lrnId}/submissions/latest
     * - 제출 이력 없으면 204 No Content
     */
    @GetMapping("/api/v1/learnings/{lrnId}/submissions/latest")
    public ResponseEntity<SubmissionResponseDto> getLatestSubmission(
        @PathVariable("lrnId") Long lrnId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = currentUser(userDetails);
        SubmissionResponseDto latest = lrnGradingService.getLatestSubmission(lrnId, user);
        if (latest == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(latest);
    }

    @GetMapping("/api/v1/learnings/{lrnId}/blanks/{blankOrd}/hint")
    public ResponseEntity<HintResponseDto> getHint(
        @PathVariable("lrnId") Long lrnId,
        @PathVariable("blankOrd") Integer blankOrd,
        @RequestParam("level") Integer level,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByLgnId(userDetails.getUsername())
            .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));
        return ResponseEntity.ok(lrnHintService.getHint(lrnId, blankOrd, level, user));
    }

    /**
     * 학습 이름 수정
     * PATCH /api/v1/learnings/{lrnId}/name
     */
    @PatchMapping("/api/v1/learnings/{lrnId}/name")
    public ResponseEntity<Map<String, String>> renameLearning(
        @PathVariable("lrnId") Long lrnId,
        @RequestBody Map<String, String> body,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = currentUser(userDetails);
        String newName = body.get("name");
        learningQueryService.rename(lrnId, newName, user);
        return ResponseEntity.ok(Map.of("name", newName));
    }

    /**
     * 임시 답안 저장 (자동저장)
     * PUT /api/v1/learnings/{lrnId}/draft
     * - 전체 덮어쓰기 방식 (부분 업데이트 아님)
     */
    @PutMapping("/api/v1/learnings/{lrnId}/draft")
    public ResponseEntity<Void> saveDraft(
        @PathVariable("lrnId") Long lrnId,
        @RequestBody DraftSaveRequestDto request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = currentUser(userDetails);
        lrnDraftService.save(lrnId, request, user);
        return ResponseEntity.noContent().build();
    }

    /**
     * 임시 답안 조회
     * GET /api/v1/learnings/{lrnId}/draft
     * - 저장된 draft 없으면 204 No Content
     */
    @GetMapping("/api/v1/learnings/{lrnId}/draft")
    public ResponseEntity<DraftResponseDto> getDraft(
        @PathVariable("lrnId") Long lrnId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = currentUser(userDetails);
        DraftResponseDto draft = lrnDraftService.find(lrnId, user);
        if (draft == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(draft);
    }
}