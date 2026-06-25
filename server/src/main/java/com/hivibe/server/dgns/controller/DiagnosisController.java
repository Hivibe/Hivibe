package com.hivibe.server.dgns.controller;

import com.hivibe.server.dgns.dto.DiagnosisSaveRequestDto;
import com.hivibe.server.dgns.dto.DiagnosisSaveResponseDto;
import com.hivibe.server.dgns.service.DiagnosisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/diagnoses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
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
}