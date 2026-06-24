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

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final DgnsRepository dgnsRepository;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    /** 전체 뱃지 목록 조회 (획득 + 미획득) */
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

    /**
     * 뱃지 조건 체크 및 신규 지급
     * - 진단 저장 후, 노트 저장 후 호출하면 됨
     * - 이번 호출에서 새로 획득한 뱃지는 isNew = true로 마킹돼서 내려감 (팝업용)
     */
    @Transactional
    public List<BadgeResponseDto> checkAndAward(String lgnId) {
        User user = getUser(lgnId);
        Long userId = user.getId();

        List<Badge> newBadges = new ArrayList<>();

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

        // POLYGLOT — 3개 이상 언어
        checkBadge(userId, BadgeType.POLYGLOT, newBadges, user, () -> {
            List<String> langs = dgnsRepository.findDistinctLangByUserId(userId);
            return langs.size() >= 3;
        });

        // ON_FIRE — 7일 연속 진단
        checkBadge(userId, BadgeType.ON_FIRE, newBadges, user,
                () -> checkStreak(userId, 7));

        // BOOKWORM — 노트 10개 이상
        checkBadge(userId, BadgeType.BOOKWORM, newBadges, user,
                () -> noteRepository.countByUser_Id(userId) >= 10);

        if (!newBadges.isEmpty()) {
            badgeRepository.saveAll(newBadges);
        }

        // 이번에 새로 딴 뱃지 key만 모아서, 전체 목록에 isNew 마킹
        List<String> newKeys = newBadges.stream()
                .map(Badge::getBadgeKey)
                .collect(Collectors.toList());

        List<BadgeResponseDto> result = getBadges(lgnId);
        result.forEach(dto -> {
            if (newKeys.contains(dto.getKey())) {
                dto.markAsNew();
            }
        });
        return result;
    }

    /** 조건 체크 후 신규 뱃지 리스트에 추가하는 헬퍼 */
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

    /** 연속 진단 일수 체크 */
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