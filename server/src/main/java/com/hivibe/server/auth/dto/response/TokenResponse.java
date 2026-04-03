package com.hivibe.server.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
 
/**
 * 토큰 응답 DTO
 * - 로그인 및 토큰 재발급 시 반환
 */
@Getter
@Builder
@AllArgsConstructor
public class TokenResponse {
    
    /** JWT Access Token (유효기간 30분) */
    private String accessToken;
 
    /** JWT Refresh Token (유효기간 14일) */
    private String refreshToken;
 
    /** Access Token 만료 시간 (ms) */
    private Long accessTokenExpiresIn;
}
