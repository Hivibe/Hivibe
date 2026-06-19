package com.hivibe.server.sign.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class LoginRequestDto {

    @NotBlank
    private String lgnId;

    @NotBlank
    private String lgnPwsd;
}