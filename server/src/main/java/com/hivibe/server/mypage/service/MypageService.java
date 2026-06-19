package com.hivibe.server.mypage.service;

import com.hivibe.server.domain.entity.User;
import com.hivibe.server.mypage.dto.*;
import com.hivibe.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MypageService {

    private final UserRepository userRepository;

    // 마이페이지 조회
    public UserProfileResponseDto getProfile(String lgnId) {
        User user = userRepository.findByLgnId(lgnId)
            .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요."));
        return new UserProfileResponseDto(user);
    }

    // 프로필 수정 (이름, 이메일)
    @Transactional
    public UserProfileResponseDto updateProfile(String lgnId, UserProfileUpdateDto dto) {
        User user = userRepository.findByLgnId(lgnId)
            .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요."));
        if (dto.getUserNm()    != null) user.setUserNm(dto.getUserNm());
        if (dto.getUserEmail() != null) user.setUserEmail(dto.getUserEmail());
        return new UserProfileResponseDto(user);
    }

    // 프로필 사진 업로드
    @Transactional
    public String updateProfileImage(String lgnId, MultipartFile file) throws IOException {
        User user = userRepository.findByLgnId(lgnId)
            .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요."));

        String uploadDir = System.getProperty("user.dir") + "/uploads/profile/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        file.transferTo(new File(uploadDir + fileName));

        String imageUrl = "/uploads/profile/" + fileName;
        user.setUserPhoto(imageUrl);
        return imageUrl;
    }

    // 휴대폰 번호 저장
    @Transactional
    public void updatePhone(String lgnId, UserPhoneUpdateDto dto) {
        User user = userRepository.findByLgnId(lgnId)
            .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요."));
        user.setUserPhone(dto.getUserPhone());
    }

    // 설정 저장 (마케팅, 복습 알림)
    @Transactional
    public void updateSettings(String lgnId, UserSettingsUpdateDto dto) {
        User user = userRepository.findByLgnId(lgnId)
            .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요."));
        if (dto.getMktgAgreeYn()   != null) user.setMktgAgreeYn(dto.getMktgAgreeYn());
        if (dto.getReviewAlarmYn() != null) user.setReviewAlarmYn(dto.getReviewAlarmYn());
    }
}