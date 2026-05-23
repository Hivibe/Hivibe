// controller/UserController.java
package com.hivibe.server.mypage.controller;

import com.hivibe.server.dto.*;
import com.hivibe.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 임시 lgnId — 팀원 JWT 머지 후 SecurityContext에서 꺼내도록 교체
    private String getCurrentLgnId() {
        return "testuser";
    }

    // 마이페이지 조회
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDto> getProfile() {
        return ResponseEntity.ok(userService.getProfile(getCurrentLgnId()));
    }

    // 프로필 수정
    @PatchMapping("/me")
    public ResponseEntity<UserProfileResponseDto> updateProfile(
            @RequestBody UserProfileUpdateDto dto) {
        return ResponseEntity.ok(userService.updateProfile(getCurrentLgnId(), dto));
    }

    // 프로필 사진 업로드
    @PostMapping("/me/profile-image")
    public ResponseEntity<String> updateProfileImage(
            @RequestParam("image") MultipartFile file) throws IOException {
        String url = userService.updateProfileImage(getCurrentLgnId(), file);
        return ResponseEntity.ok(url);
    }

    // 휴대폰 번호 저장
    @PatchMapping("/me/phone")
    public ResponseEntity<Void> updatePhone(
            @RequestBody UserPhoneUpdateDto dto) {
        userService.updatePhone(getCurrentLgnId(), dto);
        return ResponseEntity.ok().build();
    }

    // 설정 저장
    @PatchMapping("/me/settings")
    public ResponseEntity<Void> updateSettings(
            @RequestBody UserSettingsUpdateDto dto) {
        userService.updateSettings(getCurrentLgnId(), dto);
        return ResponseEntity.ok().build();
    }
}