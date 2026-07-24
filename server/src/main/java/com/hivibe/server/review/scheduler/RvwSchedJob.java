package com.hivibe.server.review.scheduler;

import com.hivibe.server.domain.entity.RvwSched;
import com.hivibe.server.repository.RvwSchedRepository;
import com.hivibe.server.review.service.RvwMailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RvwSchedJob {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    private final RvwSchedRepository rvwSchedRepository;
    private final RvwMailService mailService;

    /** 매시 정각 실행. 해당 시각을 희망한 사용자에게만 발송. */
    @Transactional
    @Scheduled(cron = "0 0 * * * *", zone = "Asia/Seoul")
    public void dispatchScheduled() {
        LocalDateTime now = LocalDateTime.now(KST);
        dispatch(now.toLocalDate(), now.getHour());
    }

    /** 수동 트리거(테스트/시연)용. 시각 조건을 그대로 받아 실행. */
    @Transactional
    public int dispatch(LocalDate today, int hour) {
        List<RvwSched> due = rvwSchedRepository.findDueSchedules(today, hour);

        if (due.isEmpty()) {
            log.debug("[RvwSched] 발송 대상 없음 ({} {}시)", today, hour);
            return 0;
        }

        log.info("[RvwSched] 발송 대상 {}건 ({} {}시)", due.size(), today, hour);

        int success = 0;
        int fail = 0;
        for (RvwSched sched : due) {
            try {
                mailService.sendReviewMail(sched);
                sched.markSent();   // 더티체킹으로 반영
                success++;
            } catch (Exception e) {
                // PENDING 유지 → 다음 주기에 자동 재시도
                log.error("[RvwSched] 발송 실패 schedId={}", sched.getRvwSchedId(), e);
                fail++;
            }
        }

        log.info("[RvwSched] 발송 완료 성공={} 실패={}", success, fail);
        return success;
    }
}