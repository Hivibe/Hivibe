package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.OptCd;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OptCdRepository extends JpaRepository<OptCd, Long> {
    Optional<OptCd> findByAnls_AnlsId(Long anlsId);
}