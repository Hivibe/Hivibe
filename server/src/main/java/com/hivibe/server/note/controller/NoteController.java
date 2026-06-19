package com.hivibe.server.note.controller;

import com.hivibe.server.note.dto.NoteResponseDto;
import com.hivibe.server.note.dto.NoteSaveRequestDto;
import com.hivibe.server.note.dto.NoteUpdateRequestDto;
import com.hivibe.server.note.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class NoteController {

    private final NoteService noteService;

    private String getCurrentLgnId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
    // 전체 노트 목록
    @GetMapping
    public ResponseEntity<List<NoteResponseDto>> getAllNotes(
            @RequestParam(required = false) String type) {
        if ("LEARNING".equals(type)) {
            return ResponseEntity.ok(noteService.getLearningNotes(getCurrentLgnId()));
        } else if ("MANUAL".equals(type)) {
            return ResponseEntity.ok(noteService.getManualNotes(getCurrentLgnId()));
        } else if ("BOOKMARK".equals(type)) {
            return ResponseEntity.ok(noteService.getBookmarkedNotes(getCurrentLgnId()));
        }
        return ResponseEntity.ok(noteService.getAllNotes(getCurrentLgnId()));
    }

    // 노트 단건 조회
    @GetMapping("/{noteId}")
    public ResponseEntity<NoteResponseDto> getNote(@PathVariable Long noteId) {
        return ResponseEntity.ok(noteService.getNote(getCurrentLgnId(), noteId));
    }

    // 노트 저장
    @PostMapping
    public ResponseEntity<NoteResponseDto> saveNote(@RequestBody NoteSaveRequestDto dto) {
        return ResponseEntity.ok(noteService.saveNote(getCurrentLgnId(), dto));
    }

    // 노트 수정
    @PatchMapping("/{noteId}")
    public ResponseEntity<NoteResponseDto> updateNote(
            @PathVariable Long noteId,
            @RequestBody NoteUpdateRequestDto dto) {
        return ResponseEntity.ok(noteService.updateNote(getCurrentLgnId(), noteId, dto));
    }

    // 즐겨찾기 토글
    @PatchMapping("/{noteId}/bookmark")
    public ResponseEntity<NoteResponseDto> toggleBookmark(@PathVariable Long noteId) {
        return ResponseEntity.ok(noteService.toggleBookmark(getCurrentLgnId(), noteId));
    }

    // 노트 삭제
    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long noteId) {
        noteService.deleteNote(getCurrentLgnId(), noteId);
        return ResponseEntity.ok().build();
    }
}