package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.OrnCd;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrnCdRepository extends JpaRepository<OrnCd, Long> {
}