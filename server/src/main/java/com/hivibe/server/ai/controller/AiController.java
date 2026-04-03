package com.hivibe.server.ai.controller;

import com.hivibe.server.ai.dto.AiResponseDto;
import com.hivibe.server.ai.service.AiService;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AiController {

    private final AiService aiService;

    @PostMapping("/ask")
    public AiResponseDto ask(@RequestBody Map<String, String> request) {
        String userCode = request.get("prompt");
        return aiService.askGemini(userCode);
    }
}