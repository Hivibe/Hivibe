package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.LrnSubm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LrnSubmRepository extends JpaRepository<LrnSubm, Long> {

    /**
     * 특정 학습 세션의 N차 시도 답안 목록 (빈칸 순서대로)
     * - 첫 제출(attemptNo=1) vs 최종 제출 비교에 사용
     */
    List<LrnSubm> findByLrn_LrnIdAndAttemptNoOrderByBlank_BlankOrdAsc(Long lrnId, Integer attemptNo);

    /**
     * 학습 세션의 모든 제출 이력 (최신순)
     */
    List<LrnSubm> findByLrn_LrnIdOrderBySubmAtDesc(Long lrnId);
}