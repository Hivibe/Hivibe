package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.Lrn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LrnRepository extends JpaRepository<Lrn, Long> {

    /**
     * 사용자별 학습 세션 목록 (최신순)
     * - User.id 필드를 참조: Lrn.user.id
     */
    List<Lrn> findByUser_IdOrderByCreatedAtDesc(Long userId);
}