package com.hivibe.server.badge.service;

import com.hivibe.server.badge.dto.BadgeResponseDto;
import com.hivibe.server.badge.type.BadgeType;
import com.hivibe.server.domain.entity.Badge;
import com.hivibe.server.domain.entity.Dgns;
import com.hivibe.server.domain.entity.User;
import com.hivibe.server.repository.BadgeRepository;
import com.hivibe.server.repository.DgnsRepository;
import com.hivibe.server.repository.NoteRepository;
import com.hivibe.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final DgnsRepository dgnsRepository;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    // ── 뱃지 목록 조회 (획득 + 미획득 전체) ──
    public List<BadgeResponseDto> getBadges(String lgnId) {
        User user = getUser(lgnId);

        List<Badge> achievedList = badgeRepository.findByUser_Id(user.getId());
        Map<String, Badge> achievedMap = achievedList.stream()
                .collect(Collectors.toMap(Badge::getBadgeKey, b -> b));

        List<BadgeResponseDto> result = new ArrayList<>();
        for (BadgeType type : BadgeType.values()) {
            if (achievedMap.containsKey(type.getKey())) {
                result.add(new BadgeResponseDto(achievedMap.get(type.getKey()), type));
            } else {
                result.add(new BadgeResponseDto(type));
            }
        }
        return result;
    }

    // ── 뱃지 조건 체크 및 신규 지급 ──
    @Transactional
    public List<BadgeResponseDto> checkAndAward(String lgnId) {
        User user = getUser(lgnId);
        Long userId = user.getId();

        List<Badge> newBadges = new ArrayList<>();

        // ── 진단 관련 ──

        // FIRST_SCAN — 진단 1회 이상
        checkBadge(userId, BadgeType.FIRST_SCAN, newBadges, user,
                () -> dgnsRepository.countByUser_Id(userId) >= 1);

        // SPEED_OPTIMIZER — 최고 점수 90점 이상
        checkBadge(userId, BadgeType.SPEED_OPTIMIZER, newBadges, user, () -> {
            Integer maxScore = dgnsRepository.findMaxScoreByUserId(userId);
            return maxScore != null && maxScore >= 90;
        });

        // PERFECTIONIST — 100점 달성
        checkBadge(userId, BadgeType.PERFECTIONIST, newBadges, user, () -> {
            Integer maxScore = dgnsRepository.findMaxScoreByUserId(userId);
            return maxScore != null && maxScore >= 100;
        });

        // GRADE_S — S등급 달성 (cdGrd == "S")
        checkBadge(userId, BadgeType.GRADE_S, newBadges, user,
                () -> dgnsRepository.existsByUserIdAndGrade(userId, "S"));

        // POLYGLOT — 3개 이상 언어
        checkBadge(userId, BadgeType.POLYGLOT, newBadges, user, () -> {
            List<String> langs = dgnsRepository.findDistinctLangByUserId(userId);
            return langs.size() >= 3;
        });

        // ON_FIRE — 7일 연속 진단
        checkBadge(userId, BadgeType.ON_FIRE, newBadges, user,
                () -> checkStreak(userId, 7));

        // CONSISTENT — 30일 연속 진단
        checkBadge(userId, BadgeType.CONSISTENT, newBadges, user,
                () -> checkStreak(userId, 30));

        // CODE_VETERAN — 진단 50회 이상
        checkBadge(userId, BadgeType.CODE_VETERAN, newBadges, user,
                () -> dgnsRepository.countByUser_Id(userId) >= 50);

        // ── 노트 관련 ──

        // BOOKWORM — 노트 10개 이상
        checkBadge(userId, BadgeType.BOOKWORM, newBadges, user,
                () -> noteRepository.countByUser_Id(userId) >= 10);

        // NOTE_MASTER — 노트 30개 이상
        checkBadge(userId, BadgeType.NOTE_MASTER, newBadges, user,
                () -> noteRepository.countByUser_Id(userId) >= 30);

        // ── 학습 관련 (LRN 테이블 연동 필요) ──
        // TODO: 팀원 학습 기능 Repository 연동 후 구현 예정
        // FIRST_LEARNER — lrnRepository.countByUser_Id(userId) >= 1
        // PERFECT_ANSWER — lrnRepository.existsPerfectSubmissionByUserId(userId)
        // STUDY_HARD — lrnRepository.countByUser_Id(userId) >= 10

        if (!newBadges.isEmpty()) {
            badgeRepository.saveAll(newBadges);
        }

        // 전체 뱃지 목록 조회
        List<Badge> achievedList = badgeRepository.findByUser_Id(user.getId());
        Map<String, Badge> achievedMap = achievedList.stream()
                .collect(Collectors.toMap(Badge::getBadgeKey, b -> b));

        // 방금 획득한 뱃지 키 목록
        Set<String> newlyAchievedKeys = newBadges.stream()
                .map(Badge::getBadgeKey)
                .collect(Collectors.toSet());

        List<BadgeResponseDto> result = new ArrayList<>();
        for (BadgeType type : BadgeType.values()) {
            if (newlyAchievedKeys.contains(type.getKey())) {
                // 방금 획득 — newlyAchieved = true
                result.add(new BadgeResponseDto(type, true));
            } else if (achievedMap.containsKey(type.getKey())) {
                result.add(new BadgeResponseDto(achievedMap.get(type.getKey()), type));
            } else {
                result.add(new BadgeResponseDto(type));
            }
        }
        return result;
    }

    // ── 학습 뱃지 전용 체크 (팀원 학습 기능에서 직접 호출) ──
    @Transactional
    public void checkLearningBadges(String lgnId, long learningCount, boolean isPerfect) {
        User user = getUser(lgnId);
        Long userId = user.getId();

        List<Badge> newBadges = new ArrayList<>();

        // FIRST_LEARNER — 첫 학습 완료
        checkBadge(userId, BadgeType.FIRST_LEARNER, newBadges, user,
                () -> learningCount >= 1);

        // STUDY_HARD — 학습 10회 이상
        checkBadge(userId, BadgeType.STUDY_HARD, newBadges, user,
                () -> learningCount >= 10);

        // PERFECT_ANSWER — 빈칸 100% 정답
        if (isPerfect) {
            checkBadge(userId, BadgeType.PERFECT_ANSWER, newBadges, user, () -> true);
        }

        if (!newBadges.isEmpty()) {
            badgeRepository.saveAll(newBadges);
        }
    }

    // ── 헬퍼 메서드 ──

    private void checkBadge(Long userId, BadgeType type, List<Badge> newBadges,
            User user, ConditionChecker checker) {
        if (badgeRepository.existsByUser_IdAndBadgeKey(userId, type.getKey()))
            return;
        if (checker.check()) {
            newBadges.add(Badge.builder()
                    .user(user)
                    .badgeKey(type.getKey())
                    .build());
        }
    }

    private boolean checkStreak(Long userId, int required) {
        List<Dgns> list = dgnsRepository.findByUser_IdOrderByDgnsDtAsc(userId);
        if (list.size() < required)
            return false;

        List<LocalDate> dates = list.stream()
                .map(d -> d.getDgnsDt().toLocalDate())
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        if (dates.size() < required)
            return false;

        int streak = 1;
        for (int i = 1; i < dates.size(); i++) {
            if (dates.get(i).equals(dates.get(i - 1).plusDays(1))) {
                streak++;
                if (streak >= required)
                    return true;
            } else {
                streak = 1;
            }
        }
        return false;
    }

    private User getUser(String lgnId) {
        return userRepository.findByLgnId(lgnId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요."));
    }

    @FunctionalInterface
    private interface ConditionChecker {
        boolean check();
    }
}