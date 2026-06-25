package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.Blank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlankRepository extends JpaRepository<Blank, Long> {

    List<Blank> findByBlankSet_BlankSetIdOrderByBlankOrdAsc(Long blankSetId);
}