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
import java.util.List;

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

        List<String> grades = lrnRepository.findCompletedGradesByUserId(userId);

        int discountPercent = calculateLearningDiscount(grades);

        UserGrd computed = calculateGrade(total, discountPercent);

        UserGrd before = UserGrd.from(user.getUserGrd());

        // 강등 방지: 계산값이 기존보다 낮으면 기존 유지
        UserGrd after = (computed.ordinal() < before.ordinal()) ? before : computed;

        user.updateGrade(after.name(), (int) total);

        if (after.ordinal() > before.ordinal()) {
            log.info("[UserGrd] 승급 userId={} {} → {} (total={})", userId, before, after, total);
            return after;
        }
        return null;
    }

    private int calculateLearningDiscount(List<String> grades) {
        if (grades == null || grades.isEmpty()) {
            return 0;
        }

        double average = grades.stream()
                .mapToInt(this::gradeToScore)
                .average()
                .orElse(0);

        if (average >= 90)
            return 10; // S 수준
        if (average >= 80)
            return 7; // A 수준
        if (average >= 70)
            return 4; // B 수준

        return 0; // C 수준
    }

    private int gradeToScore(String grade) {
        if (grade == null)
            return 0;

        return switch (grade.toUpperCase()) {
            case "S" -> 100;
            case "A" -> 85;
            case "B" -> 70;
            case "C" -> 50;
            default -> 0;
        };
    }

    private UserGrd calculateGrade(long total, int discountPercent) {
        int bronze = discountedThreshold(3, discountPercent);
        int silver = discountedThreshold(10, discountPercent);
        int gold = discountedThreshold(25, discountPercent);
        int platinum = discountedThreshold(50, discountPercent);
        int diamond = discountedThreshold(100, discountPercent);

        if (total >= diamond) {
            return UserGrd.DIAMOND;
        }
        if (total >= platinum) {
            return UserGrd.PLATINUM;
        }
        if (total >= gold) {
            return UserGrd.GOLD;
        }
        if (total >= silver) {
            return UserGrd.SILVER;
        }
        if (total >= bronze) {
            return UserGrd.BRONZE;
        }

        return UserGrd.BASIC;
    }

    private int discountedThreshold(int original, int discountPercent) {
        return (int) Math.ceil(original * (100 - discountPercent) / 100.0);
    }

    @Transactional(readOnly = true)
    public TierProgress getTierProgress(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<String> grades = lrnRepository.findCompletedGradesByUserId(userId);
        int discountPercent = calculateLearningDiscount(grades);

        UserGrd current = UserGrd.from(user.getUserGrd());
        UserGrd next = current.next();

        int nextRequiredCount = next == null
                ? 0
                : discountedThreshold(next.getMinCount(), discountPercent);

        return new TierProgress(discountPercent, nextRequiredCount);
    }

    public record TierProgress(
            int discountPercent,
            int nextRequiredCount) {
    }
}