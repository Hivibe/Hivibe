package com.hivibe.server.auth.dto.response;

import com.hivibe.server.common.domain.User;

import lombok.Builder;
import lombok.Getter;

/**
 * 회원가입 응답 DTO
 */

@Getter
@Builder
public class SignUpResponseDTO {

    //생성된 사용자 ID
    private Long userId;

    //로그인 ID (이메일)
    private String lgnId;

    // 사용자 이름
    private String userNm;

    // 사용자 생년월일
    private String userBrkt;

    //전화번호
    private String phoneNumber;

    //마케팅 수신 동의 여부
    private String mktgAgreeYn;

    //프로필 사진 URL
    private String profileImgUrl;

    //가입 일시
    private String acntJoinDt;

    /**
     * User 엔티티 → SignUpResponse 변환
     * 비밀번호 등 민감한 정보는 응답에서 제외
     */
    public static SignUpResponseDTO from(User user) {
        return SignUpResponseDTO.builder()
        .userId(user.getId())
        .lgnId(user.getLgnId())
        .userNm(user.getUserNm())
        .userBrkt(user.getUserBrkt())
        .phoneNumber(user.getUserPhone())
        .mktgAgreeYn(user.getMktgAgreeYn())
        .profileImgUrl(user.getUserPhoto())
        .acntJoinDt(user.getAcntJoinDt().toString())
        .build();
    }
}
