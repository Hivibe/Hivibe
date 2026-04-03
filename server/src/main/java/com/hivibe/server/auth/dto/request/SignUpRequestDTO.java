package com.hivibe.server.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원가입 요청 DTO
 */

@Getter
@NoArgsConstructor
public class SignUpRequestDTO {
    
    ///로그인 아이디(이메일)
    @NotBlank(message = "로그인 아이디는 필수입니다.")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "유효한 이메일 형식이 아닙니다.")
    private String lgnId;

    // 인증 완료된 이메일인지 서버에서 확인하기 위해
    private String verifiedEmail;
    
    // 로그인 비밀번호
    @NotBlank(message = "로그인 비밀번호는 필수입니다.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$", message = "비밀번호는 최소 8자 이상이어야 하며, 문자, 숫자, 특수문자를 포함해야 합니다.")
    private String password;

    //비밀번호 확인
    @NotBlank(message = "비밀번호 확인은 필수입니다.")
    private String confirmPassword;

    // 사용자 이름
    @NotBlank(message = "사용자 이름은 필수입니다.")
    @Pattern(regexp = "^[A-Za-z가-힣]{2,20}$", message = "사용자 이름은 2~20자의 한글 또는 영문으로 입력해야 합니다.")
    private String userNm;

    // 사용자 생년월일
    @Pattern(regexp = "^\\d{8}$", message = "생년월일은 YYYYMMDD 형식이어야 합니다.")
    private String userBrkt;

    // 프로필 사진
    private String profileImgUrl;

    // 사용자 전화번호
    @Pattern(regexp = "^\\d{3}-\\d{3,4}-\\d{4}$", message = "전화번호는 XXX-XXX(X)-XXXX 형식이어야 합니다.")
    private String phoneNumber;

    // 마케팅 수신 동의 여부
    @NotBlank(message = "마케팅 수신 동의는 필수입니다.")
    private String mktgAgreeYn;

}
