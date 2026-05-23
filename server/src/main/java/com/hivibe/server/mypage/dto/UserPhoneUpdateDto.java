// dto/UserPhoneUpdateDto.java
package com.hivibe.server.mypage.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UserPhoneUpdateDto {
    private String userPhone;  // - 없이 11자리
}