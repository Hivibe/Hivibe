package com.hivibe.server.controller;

import com.hivibe.server.dto.AiRequestDto;
import com.hivibe.server.dto.AiResponseDto;
import com.hivibe.server.service.AiService;
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
        String userCode = request.get("prompt");  // 키 이름은 그대로, 변수명만 변경
        return aiService.askGemini(userCode);
    }
}