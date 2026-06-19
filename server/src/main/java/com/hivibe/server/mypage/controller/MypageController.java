package com.hivibe.server.mypage.controller;

import com.hivibe.server.mypage.dto.*;
import com.hivibe.server.mypage.service.MypageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MypageController {

    private final MypageService mypageService;

    private String getCurrentLgnId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // 마이페이지 조회
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDto> getProfile() {
        return ResponseEntity.ok(mypageService.getProfile(getCurrentLgnId()));
    }

    // 프로필 수정
    @PatchMapping("/me")
    public ResponseEntity<UserProfileResponseDto> updateProfile(
            @RequestBody UserProfileUpdateDto dto) {
        return ResponseEntity.ok(mypageService.updateProfile(getCurrentLgnId(), dto));
    }

    // 프로필 사진 업로드
    @PostMapping("/me/profile-image")
    public ResponseEntity<String> updateProfileImage(
            @RequestParam("image") MultipartFile file) throws IOException {
        String url = mypageService.updateProfileImage(getCurrentLgnId(), file);
        return ResponseEntity.ok(url);
    }

    // 휴대폰 번호 저장
    @PatchMapping("/me/phone")
    public ResponseEntity<Void> updatePhone(
            @RequestBody UserPhoneUpdateDto dto) {
        mypageService.updatePhone(getCurrentLgnId(), dto);
        return ResponseEntity.ok().build();
    }

    // 설정 저장
    @PatchMapping("/me/settings")
    public ResponseEntity<Void> updateSettings(
            @RequestBody UserSettingsUpdateDto dto) {
        mypageService.updateSettings(getCurrentLgnId(), dto);
        return ResponseEntity.ok().build();
    }
}