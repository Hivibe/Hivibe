package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.LrnBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LrnBlankRepository extends JpaRepository<LrnBlank, Long> {

    /** 학습 세션의 빈칸 전체 조회 (개념까지 fetch join) */
    @Query("SELECT b FROM LrnBlank b " +
           "LEFT JOIN FETCH b.concept " +
           "WHERE b.lrn.lrnId = :lrnId " +
           "ORDER BY b.blankOrd ASC")
    List<LrnBlank> findByLrnIdWithConcept(@Param("lrnId") Long lrnId);

    List<LrnBlank> findByLrn_LrnIdOrderByBlankOrdAsc(Long lrnId);

    /** 학습 세션의 빈칸 일괄 삭제 */
    @Modifying
    @Query("DELETE FROM LrnBlank b WHERE b.lrn.lrnId = :lrnId")
    void deleteByLrnId(@Param("lrnId") Long lrnId);
}