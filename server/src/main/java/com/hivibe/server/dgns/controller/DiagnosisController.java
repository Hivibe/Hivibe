package com.hivibe.server.dgns.controller;

import com.hivibe.server.dgns.dto.DiagnosisDetailDto;
import com.hivibe.server.dgns.dto.DiagnosisListItemDto;
import com.hivibe.server.dgns.dto.DiagnosisSaveRequestDto;
import com.hivibe.server.dgns.dto.DiagnosisSaveResponseDto;
import com.hivibe.server.dgns.service.DiagnosisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/diagnoses")
@RequiredArgsConstructor
public class DiagnosisController {

    private final DiagnosisService diagnosisService;

    private String getCurrentLgnId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping
    public ResponseEntity<DiagnosisSaveResponseDto> saveDiagnosis(
            @RequestBody DiagnosisSaveRequestDto request) {
        DiagnosisSaveResponseDto response = diagnosisService.saveDiagnosis(getCurrentLgnId(), request);
        return ResponseEntity.ok(response);
    }

    /** 내 진단 목록 (최신순) — "이전 분석에서 불러오기" 용 */
    @GetMapping
    public ResponseEntity<List<DiagnosisListItemDto>> getMyDiagnoses() {
        return ResponseEntity.ok(diagnosisService.getMyDiagnoses(getCurrentLgnId()));
    }

    /** 진단 단건 상세 (원본 코드 포함) */
    @GetMapping("/{dgnsId}")
    public ResponseEntity<DiagnosisDetailDto> getDiagnosisDetail(@PathVariable Long dgnsId) {
        return ResponseEntity.ok(diagnosisService.getDiagnosisDetail(getCurrentLgnId(), dgnsId));
    }

    @DeleteMapping("/{dgnsId}")
    public ResponseEntity<?> deleteDiagnosis(@PathVariable Long dgnsId) {
        // 현재 로그인한 유저의 ID(lgnId)를 서비스로 넘겨서, 본인 것인지 검증 후 삭제하도록 합니다.
        diagnosisService.deleteDiagnosis(getCurrentLgnId(), dgnsId);

        return ResponseEntity.ok().body("삭제되었습니다.");
    }
}