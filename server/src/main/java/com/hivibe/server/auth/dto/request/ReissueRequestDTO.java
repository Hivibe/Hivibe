package com.hivibe.server.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Access Token 재발급 요청 DTO
 * - Refresh Token 을 받아 새로운 Access Token 발급
 */


@Getter
@NoArgsConstructor

public class ReissueRequestDTO {

     /** 재발급에 사용할 Refresh Token */
    @NotBlank(message = "Refresh Token을 입력해주세요.")
    private String refreshToken;
    
}
