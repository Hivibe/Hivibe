package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.BlankSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BlankSetRepository extends JpaRepository<BlankSet, Long> {

    /**
     * 캐싱 조회: 같은 OptCd + 난이도 조합이 이미 있으면 재사용
     */
    Optional<BlankSet> findByOptCd_OptCdIdAndDifficulty(Long optCdId, String difficulty);
}