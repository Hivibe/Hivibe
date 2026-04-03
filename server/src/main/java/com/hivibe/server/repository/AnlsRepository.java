package com.hivibe.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hivibe.server.common.domain.Anls;

@Repository
public interface AnlsRepository extends JpaRepository<Anls, Long> {
}