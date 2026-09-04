package com.hivibe.server.activity.service;

import com.hivibe.server.domain.entity.User;
import com.hivibe.server.domain.entity.UserActivityLog;
import com.hivibe.server.repository.UserActivityLogRepository;
import com.hivibe.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserActivityLogService {

    private final UserRepository userRepository;
    private final UserActivityLogRepository activityLogRepository;

    @Transactional
    public void log(String lgnId, String eventType) {
        User user = userRepository.findByLgnId(lgnId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요."));

        UserActivityLog log = UserActivityLog.builder()
                .user(user)
                .eventType(eventType)
                .build();

        activityLogRepository.save(log);
    }
}