package com.hivibe.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hivibe.server.common.domain.OptCd;

@Repository
public interface OptCdRepository extends JpaRepository<OptCd, Long> {
}