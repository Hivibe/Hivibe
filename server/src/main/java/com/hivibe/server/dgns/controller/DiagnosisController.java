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

    @PostMapping
    public ResponseEntity<Map<String, Object>> saveDiagnosis(
            @RequestBody DiagnosisSaveRequestDto request) {
        Long id = diagnosisService.saveDiagnosis(request);
        return ResponseEntity.ok(Map.of("message", "진단 결과 저장 완료", "id", id));
    }
}