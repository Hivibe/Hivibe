package com.hivibe.server.mypage.service;

import com.hivibe.server.domain.entity.User;
import com.hivibe.server.mypage.dto.*;
import com.hivibe.server.repository.DgnsRepository;
import com.hivibe.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

import com.hivibe.server.domain.entity.Dgns;
import com.hivibe.server.domain.entity.Lrn;
import com.hivibe.server.repository.LrnRepository;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class MypageService {

    private static final List<String> ALLOWED_IMAGE_EXT = List.of("jpg", "jpeg", "png", "webp");

    private final UserRepository userRepository;
    private final DgnsRepository dgnsRepository;
    private final LrnRepository lrnRepository;

    // 공통 조회 헬퍼 - 5번 반복되던 orElseThrow 패턴 통합
    private User getUserOrThrow(String lgnId) {
        return userRepository.findByLgnId(lgnId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "유저를 찾을 수 없어요."));
    }

    // 평균 점수 -> 등급 환산 (프론트 getGrade()와 동일 기준)
    private String scoreToGrade(double score) {
        if (score >= 90)
            return "S";
        if (score >= 80)
            return "A";
        if (score >= 70)
            return "B";
        if (score >= 60)
            return "C";
        return "F";
    }

    private int calculateStreak(Set<LocalDate> activityDates) {
        if (activityDates.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now(ZoneId.of("Asia/Seoul"));

        // 오늘 활동했으면 오늘부터 계산
        // 오늘 아직 활동하지 않았다면 어제까지의 streak 유지
        LocalDate currentDate = activityDates.contains(today)
                ? today
                : today.minusDays(1);

        int streak = 0;

        while (activityDates.contains(currentDate)) {
            streak++;
            currentDate = currentDate.minusDays(1);
        }

        return streak;
    }

    private UserProfileResponseDto toResponseDto(User user) {
        long diagnosisCount = dgnsRepository.countByUser_Id(user.getId());
        Double avgScore = dgnsRepository.findAvgScoreByUserId(user.getId());
        String avgGrade = avgScore != null ? scoreToGrade(avgScore) : null;

        Set<LocalDate> activityDates = new HashSet<>();

        // 진단 날짜
        List<Dgns> diagnoses = dgnsRepository.findByUser_IdOrderByDgnsDtAsc(user.getId());

        for (Dgns dgns : diagnoses) {
            if (dgns.getDgnsDt() != null) {
                activityDates.add(dgns.getDgnsDt().toLocalDate());
            }
        }

        // 학습 날짜
        List<Lrn> learnings = lrnRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());

        for (Lrn lrn : learnings) {
            if (lrn.getCreatedAt() != null) {
                activityDates.add(lrn.getCreatedAt().toLocalDate());
            }
        }
        int streakDays = calculateStreak(activityDates);

        return new UserProfileResponseDto(
                user,
                diagnosisCount,
                avgGrade,
                streakDays);
    }

    // 마이페이지 조회
    @Transactional(readOnly = true)
    public UserProfileResponseDto getProfile(String lgnId) {
        User user = getUserOrThrow(lgnId);
        return toResponseDto(user);
    }

    // 프로필 수정 (이름, 이메일)
    @Transactional
    public UserProfileResponseDto updateProfile(String lgnId, UserProfileUpdateDto dto) {
        User user = getUserOrThrow(lgnId);

        if (dto.getUserNm() != null) {
            String nickname = dto.getUserNm().trim();
            if (nickname.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "닉네임은 빈 값일 수 없어요.");
            }
            if (nickname.length() > 20) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "닉네임은 20자 이하로 입력해주세요.");
            }
            // 닉네임 중복 체크가 필요하면 여기서 userRepository.existsByUserNm() 등으로 확인
            user.setUserNm(nickname);
        }
        if (dto.getUserEmail() != null) {
            user.setUserEmail(dto.getUserEmail());
        }
        // @Transactional + 영속 상태 엔티티라 dirty checking으로 commit 시 자동 UPDATE 됨
        // (명시적 save() 불필요하지만, 의도를 분명히 하고 싶으면 userRepository.save(user) 추가 가능)
        return toResponseDto(user);
    }

    // 프로필 사진 업로드
    @Transactional
    public String updateProfileImage(String lgnId, MultipartFile file) throws IOException {
        User user = getUserOrThrow(lgnId);

        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "파일이 비어있어요.");
        }

        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf('.') + 1).toLowerCase()
                : "";
        if (!ALLOWED_IMAGE_EXT.contains(ext)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "jpg, jpeg, png, webp 파일만 업로드 가능해요.");
        }

        String uploadDir = System.getProperty("user.dir") + "/uploads/profile/";
        File dir = new File(uploadDir);
        if (!dir.exists())
            dir.mkdirs();

        // UUID로 파일명 전체를 교체 -> 원본 파일명(경로 조작 가능성) 사용 안 함
        String fileName = UUID.randomUUID() + "." + ext;
        file.transferTo(new File(uploadDir + fileName));

        String imageUrl = "/uploads/profile/" + fileName;
        user.setUserPhoto(imageUrl);
        return imageUrl;
    }

    // 휴대폰 번호 저장
    @Transactional
    public void updatePhone(String lgnId, UserPhoneUpdateDto dto) {
        User user = getUserOrThrow(lgnId);
        user.setUserPhone(dto.getUserPhone());
    }

    // 설정 저장 (마케팅, 복습 알림)
    @Transactional
    public void updateSettings(String lgnId, UserSettingsUpdateDto dto) {
        User user = getUserOrThrow(lgnId);
        if (dto.getMktgAgreeYn() != null)
            user.setMktgAgreeYn(dto.getMktgAgreeYn());
        if (dto.getReviewAlarmYn() != null)
            user.setReviewAlarmYn(dto.getReviewAlarmYn());
    }
}