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

    public UserProfileResponseDto(User user) {
        this.id            = user.getId();
        this.lgnId         = user.getLgnId();
        this.userNm        = user.getUserNm();
        this.userEmail     = user.getUserEmail();
        this.userPhone     = user.getUserPhone();
        this.userPhoto     = user.getUserPhoto();
        this.userGrd       = user.getUserGrd();
        this.mktgAgreeYn   = user.getMktgAgreeYn();
        this.reviewAlarmYn = user.getReviewAlarmYn();
    }
}