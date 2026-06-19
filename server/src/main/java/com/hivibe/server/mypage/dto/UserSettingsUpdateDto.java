package com.hivibe.server.mypage.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UserSettingsUpdateDto {
    private String mktgAgreeYn;
    private String reviewAlarmYn;
}