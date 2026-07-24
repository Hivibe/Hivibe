package com.hivibe.server.review.service;

import com.hivibe.server.domain.entity.Lrn;
import com.hivibe.server.domain.entity.RvwSched;
import com.hivibe.server.domain.entity.User;
import com.hivibe.server.domain.enums.RvwStatus;
import com.hivibe.server.repository.UserRepository;
import com.hivibe.server.review.dto.ReviewResponseDto;
import com.hivibe.server.review.dto.ReviewSettingsRequestDto;
import com.hivibe.server.review.dto.ReviewSettingsResponseDto;
import com.hivibe.server.repository.RvwSchedRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RvwSchedService {

    /** 망각곡선 간격(일). 인덱스가 곧 stage 값. */
    private static final int[] INTERVALS = {1, 3, 7, 14, 30};

    private static final List<RvwStatus> ACTIVE_STATUSES =
            List.of(RvwStatus.PENDING, RvwStatus.SENT);

    private final RvwSchedRepository rvwSchedRepository;
    private final UserRepository userRepository;

    /**
     * 채점 완료 시 호출. 이미 스케줄이 있으면 아무것도 하지 않는다(재제출 대응).
     */
    @Transactional
    public void createSchedules(Lrn lrn, User user) {
        if (rvwSchedRepository.existsByLrn_LrnId(lrn.getLrnId())) {
            log.debug("[RvwSched] 이미 스케줄 존재, 생성 건너뜀 lrnId={}", lrn.getLrnId());
            return;
        }

        LocalDate base = LocalDate.now();
        List<RvwSched> list = new ArrayList<>(INTERVALS.length);
        for (int i = 0; i < INTERVALS.length; i++) {
            list.add(RvwSched.of(lrn, user, i, base.plusDays(INTERVALS[i])));
        }
        rvwSchedRepository.saveAll(list);

        syncLrnCache(lrn);
        log.info("[RvwSched] 복습 스케줄 {}건 생성 lrnId={}", list.size(), lrn.getLrnId());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDto> findMyReviews(Long userId) {
        return rvwSchedRepository.findMyReviews(userId, ACTIVE_STATUSES)
                .stream()
                .map(ReviewResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countMyReviews(Long userId) {
        return rvwSchedRepository.countByUser_IdAndStatusIn(userId, ACTIVE_STATUSES);
    }

    @Transactional
    public void complete(Long schedId, Long userId) {
        RvwSched sched = findOwned(schedId, userId);
        sched.markCompleted();
        syncLrnCache(sched.getLrn());
    }

    @Transactional
    public void skip(Long schedId, Long userId) {
        RvwSched sched = findOwned(schedId, userId);
        sched.skip();
        syncLrnCache(sched.getLrn());
    }

    /**
     * 메일 링크 등으로 학습에 재진입했을 때, 발송된(SENT) 건 중 가장 앞 단계를 완료 처리.
     */
    @Transactional
    public void completeOnRevisit(Long lrnId, Long userId) {
        rvwSchedRepository
                .findFirstByLrn_LrnIdAndStatusOrderByStageAsc(lrnId, RvwStatus.SENT)
                .filter(s -> s.isOwnedBy(userId))
                .ifPresent(s -> {
                    s.markCompleted();
                    syncLrnCache(s.getLrn());
                });
    }

    @Transactional(readOnly = true)
    public ReviewSettingsResponseDto getSettings(Long userId) {
        return ReviewSettingsResponseDto.from(findUser(userId));
    }

    @Transactional
    public ReviewSettingsResponseDto updateSettings(Long userId, ReviewSettingsRequestDto req) {
        User user = findUser(userId);
        user.updateReviewSettings(req.enabled(), req.hour());
        return ReviewSettingsResponseDto.from(user);
    }

    @Transactional
    public void deleteByLrnId(Long lrnId) {
        rvwSchedRepository.deleteByLrn_LrnId(lrnId);
    }

    /**
     * RvwSched를 기준으로 Lrn의 캐시 필드(nextReviewAt, reviewCnt) 갱신.
     * RvwSched가 원본이므로, 어긋나더라도 이 메서드를 다시 호출하면 복구된다.
     */
    @Transactional
    public void syncLrnCache(Lrn lrn) {
        Long lrnId = lrn.getLrnId();

        LocalDateTime nextDue = rvwSchedRepository
                .findFirstByLrn_LrnIdAndStatusInOrderByDueDateAscStageAsc(lrnId, ACTIVE_STATUSES)
                .map(s -> s.getDueDate().atStartOfDay())
                .orElse(null);

        int completedCnt = (int) rvwSchedRepository
                .countByLrn_LrnIdAndStatus(lrnId, RvwStatus.COMPLETED);

        lrn.syncReviewCache(nextDue, completedCnt);
    }

    private RvwSched findOwned(Long schedId, Long userId) {
        RvwSched sched = rvwSchedRepository.findById(schedId)
                .orElseThrow(() -> new IllegalArgumentException("복습 일정을 찾을 수 없습니다."));
        if (!sched.isOwnedBy(userId)) {
            throw new IllegalStateException("권한이 없습니다.");
        }
        return sched;
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}