package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.LrnSubm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LrnSubmRepository extends JpaRepository<LrnSubm, Long> {

    List<LrnSubm> findByLrn_LrnIdAndAttemptNoOrderByBlank_BlankOrdAsc(Long lrnId, Integer attemptNo);

    List<LrnSubm> findByLrn_LrnIdOrderByAttemptNoDescBlank_BlankOrdAsc(Long lrnId);

    /** 학습 세션의 제출 이력 일괄 삭제 */
    @Modifying
    @Query("DELETE FROM LrnSubm s WHERE s.lrn.lrnId = :lrnId")
    void deleteByLrnId(@Param("lrnId") Long lrnId);
}