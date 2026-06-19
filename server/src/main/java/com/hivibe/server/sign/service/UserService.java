package com.hivibe.server.sign.service;

import com.hivibe.server.config.jwt.JwtTokenProvider;
import com.hivibe.server.domain.entity.User;
import com.hivibe.server.repository.UserRepository;
import com.hivibe.server.sign.dto.request.LoginRequestDto;
import com.hivibe.server.sign.dto.request.SignupRequestDto;
import com.hivibe.server.sign.dto.response.LoginResponseDto;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;


    @Transactional
    public void signup(SignupRequestDto dto) {
        if (userRepository.existsByLgnId(dto.getLgnId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        if (dto.getUserEmail() != null && userRepository.existsByUserEmail(dto.getUserEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User user = new User();
        user.setLgnId(dto.getLgnId());
        user.setLgnPwsd(passwordEncoder.encode(dto.getLgnPwsd()));
        user.setUserNm(dto.getUserNm());
        user.setUserEmail(dto.getUserEmail());
        user.setUserBrkt(dto.getUserBrkt());
        user.setUserPhone(dto.getUserPhone());
        user.setMktgAgreeYn(Boolean.TRUE.equals(dto.getMktgAgreeYn()) ? "Y" : "N");

        // 기본값 세팅
        user.setAcntSttsCd(User.STATUS_ACTIVE);   // Active
        user.setPswdChgYn("N");
        user.setLgnFailNmtm(0);
        user.setUserGrd("BASIC");

        userRepository.save(user);
    }

    @Transactional
    public LoginResponseDto login(LoginRequestDto dto) {
        User user = userRepository.findByLgnId(dto.getLgnId())
            .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(dto.getLgnPwsd(), user.getLgnPwsd())) {
            // 로그인 실패 횟수 증가
            user.setLgnFailNmtm(user.getLgnFailNmtm() + 1);
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        // 로그인 성공 시 실패 횟수 초기화
        user.setLgnFailNmtm(0);

        String accessToken = jwtTokenProvider.createAccessToken(user.getLgnId());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getLgnId());

        return new LoginResponseDto(accessToken, refreshToken);
    }
}