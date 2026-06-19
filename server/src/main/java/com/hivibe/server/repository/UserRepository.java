package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByLgnId(String lgnId);
    boolean existsByUserEmail(String userEmail);
    Optional<User> findByLgnId(String lgnId);
    Optional<User> findByUserEmail(String userEmail);
}