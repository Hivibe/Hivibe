package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.OptCd;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OptCdRepository extends JpaRepository<OptCd, Long> {
}