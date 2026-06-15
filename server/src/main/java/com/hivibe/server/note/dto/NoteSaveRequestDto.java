package com.hivibe.server.note.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class NoteSaveRequestDto {
    private Long optCdId;      // Learning 노트일 때만 값 있음, 자유 노트는 null
    private String noteName;
    private String noteMemo;
    private String noteCn;     // 자유 노트일 때 직접 입력한 코드
    private String tag;
    private String category;
    private String lang;
}