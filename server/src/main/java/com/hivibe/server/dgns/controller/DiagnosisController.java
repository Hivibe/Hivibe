package com.hivibe.server.dgns.controller;

import com.hivibe.server.dgns.dto.DiagnosisSaveRequestDto;
import com.hivibe.server.dgns.service.DiagnosisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/diagnoses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class DiagnosisController {

    private final DiagnosisService diagnosisService;

    // 임시 lgnId — 팀원 JWT 머지 후 SecurityContext로 교체
    private String getCurrentLgnId() {
        return "cherry123";
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> saveDiagnosis(
            @RequestBody DiagnosisSaveRequestDto request) {
        Long id = diagnosisService.saveDiagnosis(getCurrentLgnId(), request);
        return ResponseEntity.ok(Map.of("message", "진단 결과 저장 완료", "id", id));
    }
}