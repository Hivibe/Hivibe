package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.Concept;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ConceptRepository extends JpaRepository<Concept, Long> {

    List<Concept> findByLrn_LrnIdOrderBySortOrdAsc(Long lrnId);

    /** 학습 세션의 개념 일괄 삭제 */
    @Modifying
    @Query("DELETE FROM Concept c WHERE c.lrn.lrnId = :lrnId")
    void deleteByLrnId(@Param("lrnId") Long lrnId);
}