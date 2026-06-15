package com.hivibe.server.config.jwt;

import com.hivibe.server.domain.entity.User;
import com.hivibe.server.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String lgnId) throws UsernameNotFoundException {
        User user = userRepository.findByLgnId(lgnId)
            .orElseThrow(() -> new UsernameNotFoundException("유저를 찾을 수 없습니다: " + lgnId));

        return org.springframework.security.core.userdetails.User
            .withUsername(user.getLgnId())
            .password(user.getLgnPwsd())
            .authorities(Collections.emptyList())
            .build();
    }
}