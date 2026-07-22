package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import jakarta.validation.constraints.NotNull;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    // 유저의 전체 노트 목록 (최신순)
    List<Note> findByUser_IdOrderByCreatedAtDesc(Long userId);

    // 유저의 Learning 노트만 (optCd 있는 것)
    List<Note> findByUser_IdAndOptCdIsNotNullOrderByCreatedAtDesc(Long userId);

    // 유저의 자유 노트만 (optCd 없는 것)
    List<Note> findByUser_IdAndOptCdIsNullOrderByCreatedAtDesc(Long userId);

    // 유저의 즐겨찾기 노트
    List<Note> findByUser_IdAndBkmkYnOrderByCreatedAtDesc(Long userId, String bkmkYn);

    // 유저의 특정 노트 조회 (본인 것만)
    Optional<Note> findByNoteIdAndUser_Id(Long noteId, Long userId);

    // 유저의 노트 총 개수 (뱃지용)
    long countByUser_Id(Long userId);

    @Query("SELECT n FROM Note n LEFT JOIN FETCH n.optCd o LEFT JOIN FETCH o.anls WHERE n.noteId = :noteId AND n.user.id = :userId")
    Optional<Note> findByNoteIdAndUser_IdWithOptCd(@NotNull Long noteId, @NotNull Long userId);
}