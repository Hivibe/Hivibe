package com.hivibe.server.activity.controller;

import com.hivibe.server.activity.service.UserActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
public class UserActivityLogController {

    private final UserActivityLogService userActivityLogService;

    @PostMapping
    public ResponseEntity<Void> logActivity(
            @RequestParam String eventType) {

        String lgnId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        userActivityLogService.log(lgnId, eventType);

        return ResponseEntity.ok().build();
    }
}