package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {

    // 유저의 전체 뱃지 목록
    List<Badge> findByUser_Id(Long userId);

    // 특정 뱃지 이미 획득했는지 확인
    boolean existsByUser_IdAndBadgeKey(Long userId, String badgeKey);
}