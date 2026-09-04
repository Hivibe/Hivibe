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
    private int actCnt;
    private String mktgAgreeYn;
    private String reviewAlarmYn;
    private long diagnosisCount;
    private String avgGrade;
    private int streakDays; // 추가

    public UserProfileResponseDto(
            User user,
            long diagnosisCount,
            String avgGrade,
            int streakDays) {
        this.id = user.getId();
        this.lgnId = user.getLgnId();
        this.userNm = user.getUserNm();
        this.userEmail = user.getUserEmail();
        this.userPhone = user.getUserPhone();
        this.userPhoto = user.getUserPhoto();
        this.userGrd = user.getUserGrd();
        this.actCnt = user.getActCnt() == null ? 0 : user.getActCnt();
        this.mktgAgreeYn = user.getMktgAgreeYn();
        this.reviewAlarmYn = user.getReviewAlarmYn();
        this.diagnosisCount = diagnosisCount;
        this.avgGrade = avgGrade;
        this.streakDays = streakDays;
    }
}