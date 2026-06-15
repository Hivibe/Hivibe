package com.hivibe.server.sign.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;

@Getter
public class SignupRequestDto {

    @NotBlank
    @Size(max = 20)
    private String lgnId;

    @NotBlank
    @Size(min = 8, max = 100)
    private String lgnPwsd;

    @Size(max = 100)
    private String userNm;

    @Email
    @Size(max = 320)
    private String userEmail;

    @Pattern(regexp = "^\\d{8}$")
    private String userBrkt; // yyyyMMdd

    @Pattern(regexp = "^\\d{10,11}$")
    private String userPhone;

    @NotNull
    private Boolean mktgAgreeYn;
}