package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.Concept;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConceptRepository extends JpaRepository<Concept, Long> {

    List<Concept> findByLrn_LrnIdOrderBySortOrdAsc(Long lrnId);
}