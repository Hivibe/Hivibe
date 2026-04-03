package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.Anls;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnlsRepository extends JpaRepository<Anls, Long> {
}