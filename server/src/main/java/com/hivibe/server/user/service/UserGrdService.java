package com.hivibe.server.user.service;

import com.hivibe.server.domain.entity.User;
import com.hivibe.server.domain.enums.UserGrd;
import com.hivibe.server.repository.DgnsRepository;
import com.hivibe.server.repository.LrnRepository;
import com.hivibe.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserGrdService {

    private final UserRepository userRepository;
    private final LrnRepository lrnRepository;
    private final DgnsRepository dgnsRepository;

    /**
     * 누적 활동 수(진단+학습)를 다시 세고 티어를 재산정한다.
     * 티어는 한 번 올라가면 내려가지 않는다.
     *
     * @return 승급했으면 새 티어, 변동 없으면 null
     */
    @Transactional
    public UserGrd recalculate(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId는 null일 수 없습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        long total = dgnsRepository.countByUser_Id(userId)
                   + lrnRepository.countByUser_Id(userId);

        UserGrd before = UserGrd.from(user.getUserGrd());
        UserGrd computed = UserGrd.of(total);

        // 강등 방지: 계산값이 기존보다 낮으면 기존 유지
        UserGrd after = (computed.ordinal() < before.ordinal()) ? before : computed;

        user.updateGrade(after.name(), (int) total);

        if (after.ordinal() > before.ordinal()) {
            log.info("[UserGrd] 승급 userId={} {} → {} (total={})", userId, before, after, total);
            return after;
        }
        return null;
    }
}