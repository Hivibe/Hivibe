package com.hivibe.server.mypage.dto;

import com.hivibe.server.domain.entity.User;
import lombok.Getter;

@Getter
public class UserProfileResponseDto {
    private Long id;
    private String lgnId;
    private String userNm;
    private String userEmail;
    private String userPhone;
    private String userPhoto;
    private String userGrd;
    private String mktgAgreeYn;
    private String reviewAlarmYn;
    private long diagnosisCount;
    private String avgGrade; // 진단 평균 점수 기준 등급 (S/A/B/C/F), 진단 기록 없으면 null

    public UserProfileResponseDto(User user, long diagnosisCount, String avgGrade) {
        this.id = user.getId();
        this.lgnId = user.getLgnId();
        this.userNm = user.getUserNm();
        this.userEmail = user.getUserEmail();
        this.userPhone = user.getUserPhone();
        this.userPhoto = user.getUserPhoto();
        this.userGrd = user.getUserGrd();
        this.mktgAgreeYn = user.getMktgAgreeYn();
        this.reviewAlarmYn = user.getReviewAlarmYn();
        this.diagnosisCount = diagnosisCount;
        this.avgGrade = avgGrade;
    }
}