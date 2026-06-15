package com.hivibe.server.note.service;

import com.hivibe.server.domain.entity.Note;
import com.hivibe.server.domain.entity.OptCd;
import com.hivibe.server.domain.entity.User;
import com.hivibe.server.note.dto.NoteResponseDto;
import com.hivibe.server.note.dto.NoteSaveRequestDto;
import com.hivibe.server.note.dto.NoteUpdateRequestDto;
import com.hivibe.server.repository.NoteRepository;
import com.hivibe.server.repository.OptCdRepository;
import com.hivibe.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository   noteRepository;
    private final UserRepository   userRepository;
    private final OptCdRepository  optCdRepository;

    // 전체 노트 목록
    public List<NoteResponseDto> getAllNotes(String lgnId) {
        User user = getUser(lgnId);
        return noteRepository.findByUser_IdOrderByCreatedAtDesc(user.getId())
            .stream().map(NoteResponseDto::new).collect(Collectors.toList());
    }

    // Learning 노트만
    public List<NoteResponseDto> getLearningNotes(String lgnId) {
        User user = getUser(lgnId);
        return noteRepository.findByUser_IdAndOptCdIsNotNullOrderByCreatedAtDesc(user.getId())
            .stream().map(NoteResponseDto::new).collect(Collectors.toList());
    }

    // 자유 노트만
    public List<NoteResponseDto> getManualNotes(String lgnId) {
        User user = getUser(lgnId);
        return noteRepository.findByUser_IdAndOptCdIsNullOrderByCreatedAtDesc(user.getId())
            .stream().map(NoteResponseDto::new).collect(Collectors.toList());
    }

    // 즐겨찾기 노트
    public List<NoteResponseDto> getBookmarkedNotes(String lgnId) {
        User user = getUser(lgnId);
        return noteRepository.findByUser_IdAndBkmkYnOrderByCreatedAtDesc(user.getId(), "Y")
            .stream().map(NoteResponseDto::new).collect(Collectors.toList());
    }

    // 노트 단건 조회
    public NoteResponseDto getNote(String lgnId, Long noteId) {
        User user = getUser(lgnId);
        Note note = noteRepository.findByNoteIdAndUser_Id(noteId, user.getId())
            .orElseThrow(() -> new RuntimeException("노트를 찾을 수 없어요."));
        return new NoteResponseDto(note);
    }

    // 노트 저장 (Learning + 자유 둘 다)
    @Transactional
    public NoteResponseDto saveNote(String lgnId, NoteSaveRequestDto dto) {
        User user = getUser(lgnId);

        OptCd optCd = null;
        if (dto.getOptCdId() != null) {
            optCd = optCdRepository.findById(dto.getOptCdId())
                .orElseThrow(() -> new RuntimeException("최적화 코드를 찾을 수 없어요."));
        }

        Note note = Note.builder()
            .user(user)
            .optCd(optCd)
            .noteName(dto.getNoteName())
            .noteMemo(dto.getNoteMemo())
            .noteCn(dto.getNoteCn())
            .tag(dto.getTag())
            .category(dto.getCategory())
            .lang(dto.getLang())
            .bkmkYn("N") 
            .build();
        return new NoteResponseDto(noteRepository.save(note));
    }

    // 노트 수정
    @Transactional
    public NoteResponseDto updateNote(String lgnId, Long noteId, NoteUpdateRequestDto dto) {
        User user = getUser(lgnId);
        Note note = noteRepository.findByNoteIdAndUser_Id(noteId, user.getId())
            .orElseThrow(() -> new RuntimeException("노트를 찾을 수 없어요."));

        if (dto.getNoteName()  != null) note.setNoteName(dto.getNoteName());
        if (dto.getNoteMemo()  != null) note.setNoteMemo(dto.getNoteMemo());
        if (dto.getNoteCn()    != null) note.setNoteCn(dto.getNoteCn());
        if (dto.getTag()       != null) note.setTag(dto.getTag());
        if (dto.getCategory()  != null) note.setCategory(dto.getCategory());
        if (dto.getLang()      != null) note.setLang(dto.getLang());

        return new NoteResponseDto(note);
    }

    // 즐겨찾기 토글
    @Transactional
    public NoteResponseDto toggleBookmark(String lgnId, Long noteId) {
        User user = getUser(lgnId);
        Note note = noteRepository.findByNoteIdAndUser_Id(noteId, user.getId())
            .orElseThrow(() -> new RuntimeException("노트를 찾을 수 없어요."));
        note.setBkmkYn(note.getBkmkYn().equals("Y") ? "N" : "Y");
        return new NoteResponseDto(note);
    }

    // 노트 삭제
    @Transactional
    public void deleteNote(String lgnId, Long noteId) {
        User user = getUser(lgnId);
        Note note = noteRepository.findByNoteIdAndUser_Id(noteId, user.getId())
            .orElseThrow(() -> new RuntimeException("노트를 찾을 수 없어요."));
        noteRepository.delete(note);
    }

    private User getUser(String lgnId) {
        return userRepository.findByLgnId(lgnId)
            .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요."));
    }
}