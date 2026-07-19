package com.hivibe.server.dgns.dto;

import com.hivibe.server.domain.entity.Dgns;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class DiagnosisListItemDto {
    private Long dgnsId;
    private String name;
    private String lang;
    private LocalDateTime date;

    public DiagnosisListItemDto(Dgns dgns) {
        this.dgnsId = dgns.getDgnsId();
        this.name = dgns.getDgnsNm();
        this.lang = dgns.getAnls().getOrnCd().getLang();
        this.date = dgns.getDgnsDt();
    }
}