package com.hivibe.server.dgns.dto;

import com.hivibe.server.domain.entity.Dgns;
import lombok.Getter;

@Getter
public class DiagnosisDetailDto {
    private String name;
    private String lang;
    private String content;

    public DiagnosisDetailDto(Dgns dgns) {
        this.name = dgns.getDgnsNm();
        this.lang = dgns.getAnls().getOrnCd().getLang();
        this.content = dgns.getAnls().getOrnCd().getCdCn();
    }
}