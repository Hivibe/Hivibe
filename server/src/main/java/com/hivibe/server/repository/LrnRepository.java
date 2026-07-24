package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.Lrn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LrnRepository extends JpaRepository<Lrn, Long> {

    /**
     * 사용자별 학습 세션 목록 (최신순)
     * - User.id 필드를 참조: Lrn.user.id
     */
    @Query("SELECT l FROM Lrn l " +
           "JOIN FETCH l.optCd o " +
           "JOIN FETCH o.anls a " +
           "WHERE l.user.id = :userId " +
           "ORDER BY l.createdAt DESC")
    List<Lrn> findByUser_IdOrderByCreatedAtDesc(@Param("userId") Long userId);

    // 삭제 추가
    List<Lrn> findByOptCd_Anls_AnlsId(Long anlsId);

    // 추가 7.20
    long countByUser_Id(Long userId);
}