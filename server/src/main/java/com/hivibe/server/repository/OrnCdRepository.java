package com.hivibe.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hivibe.server.common.domain.OrnCd;

@Repository
public interface OrnCdRepository extends JpaRepository<OrnCd, Long> {
}