package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.LrnDraft;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LrnDraftRepository extends JpaRepository<LrnDraft, Long> {

    Optional<LrnDraft> findByLrn_LrnId(Long lrnId);

    void deleteByLrn_LrnId(Long lrnId);
}