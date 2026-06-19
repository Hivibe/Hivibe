package com.hivibe.server.note.dto;

import com.hivibe.server.domain.entity.Note;
import com.hivibe.server.domain.entity.OptCd;
import com.hivibe.server.domain.entity.Anls; 
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class NoteResponseDto {

    private Long noteId;
    private String noteName;
    private String noteMemo;
    private String noteCn;
    private String bkmkYn;
    private String tag;
    private String category;
    private String lang;
    private LocalDateTime createdAt;
    private String noteType;     // "LEARNING" | "MANUAL"

    // 연결된 최적화 코드 정보 (Learning 노트일 때)
    private Long optCdId;
    private String optCdContent;
    private String aiSummary;

    public NoteResponseDto(Note note) {
        this.noteId    = note.getNoteId();
        this.noteName  = note.getNoteName();
        this.noteMemo  = note.getNoteMemo();
        this.noteCn    = note.getNoteCn();
        this.bkmkYn    = note.getBkmkYn();
        this.tag       = note.getTag();
        this.category  = note.getCategory();
        this.lang      = note.getLang();
        this.createdAt = note.getCreatedAt();

        if (note.getOptCd() != null) {
            this.noteType      = "LEARNING";
            this.optCdId       = note.getOptCd().getOptCdId();
            this.optCdContent  = note.getOptCd().getCdCn();
            this.aiSummary     = note.getOptCd().getAnls().getAiSummry();
        } else {
            this.noteType = "MANUAL";
        }
    }
}