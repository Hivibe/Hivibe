package com.hivibe.server.note.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class NoteUpdateRequestDto {
    private String noteName;
    private String noteMemo;
    private String noteCn;
    private String tag;
    private String category;
    private String lang;
}