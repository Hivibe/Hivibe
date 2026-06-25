package com.hivibe.server.config.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        log.info("[JWT] URI={}, AuthHeader={}",
            request.getRequestURI(),
            authHeader == null ? "null" : authHeader.substring(0, Math.min(30, authHeader.length())) + "...");

        String token = resolveToken(request);

        if (token == null) {
            log.info("[JWT] 토큰 없음 → 다음 필터로");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            boolean valid = jwtTokenProvider.validateToken(token);
            log.info("[JWT] validateToken={}", valid);

            if (valid) {
                String lgnId = jwtTokenProvider.getLgnId(token);
                log.info("[JWT] lgnId={}", lgnId);

                UserDetails userDetails = userDetailsService.loadUserByUsername(lgnId);

                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                    );

                SecurityContextHolder.getContext().setAuthentication(auth);
                log.info("[JWT] 인증 성공: {}", userDetails.getUsername());
            }
        } catch (Exception e) {
            log.error("[JWT] 검증 중 예외", e);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}