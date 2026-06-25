package com.hivibe.server.dgns.controller;

import com.hivibe.server.dgns.dto.DiagnosisDetailDto;
import com.hivibe.server.dgns.dto.DiagnosisListItemDto;
import com.hivibe.server.dgns.dto.DiagnosisSaveRequestDto;
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
    public ResponseEntity<Map<String, Object>> saveDiagnosis(
            @RequestBody DiagnosisSaveRequestDto request) {
        Long id = diagnosisService.saveDiagnosis(getCurrentLgnId(), request);
        return ResponseEntity.ok(Map.of("message", "진단 결과 저장 완료", "id", id));
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
}