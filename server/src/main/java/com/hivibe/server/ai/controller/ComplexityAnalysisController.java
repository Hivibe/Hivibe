package com.hivibe.server.ai.controller;

import com.hivibe.server.ai.dto.ComplexityAnalysisRequest;
import com.hivibe.server.ai.dto.ComplexityAnalysisResponse;
import com.hivibe.server.ai.service.ComplexityAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
public class ComplexityAnalysisController {

    private final ComplexityAnalysisService service;

    public ComplexityAnalysisController(
            ComplexityAnalysisService service
    ) {
        this.service = service;
    }

    @PostMapping("/complexity")
    public ResponseEntity<ComplexityAnalysisResponse>
    analyze(
            @RequestBody
            ComplexityAnalysisRequest request
    ) {

        return ResponseEntity.ok(
                service.analyze(request)
        );
    }
}