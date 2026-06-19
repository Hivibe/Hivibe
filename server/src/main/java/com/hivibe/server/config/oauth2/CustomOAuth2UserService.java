package com.hivibe.server.config.oauth2;

import com.hivibe.server.domain.entity.User;
import com.hivibe.server.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo userInfo = getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        String email = userInfo.getEmail();
        String name = userInfo.getName();

        // 이메일 없으면 ID로 대체
        if (email == null) {
            email = registrationId + "_" + userInfo.getId() + "@hivibe.com";
        }

        final String finalEmail = email;

        User user = userRepository.findByUserEmail(finalEmail)
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setLgnId(finalEmail);
                newUser.setLgnPwsd("OAUTH2_USER");
                newUser.setUserNm(name);
                newUser.setUserEmail(finalEmail);
                newUser.setAcntSttsCd("A");
                newUser.setPswdChgYn("N");
                newUser.setLgnFailNmtm(0);
                newUser.setMktgAgreeYn("N");
                newUser.setUserGrd("BASIC");
                return userRepository.save(newUser);
            });

        return oAuth2User;
    }

    private OAuth2UserInfo getOAuth2UserInfo(String registrationId, java.util.Map<String, Object> attributes) {
        if (registrationId.equals("google")) return new GoogleUserInfo(attributes);
        if (registrationId.equals("github")) return new GithubUserInfo(attributes);
        throw new IllegalArgumentException("지원하지 않는 소셜 로그인입니다.");
    }
}