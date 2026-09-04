package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserActivityLogRepository
        extends JpaRepository<UserActivityLog, Long> {

    List<UserActivityLog> findByUser_IdOrderByCreatedAtAsc(Long userId);
}