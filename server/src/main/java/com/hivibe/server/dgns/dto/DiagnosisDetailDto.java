package com.hivibe.server.dgns.dto;

import com.hivibe.server.domain.entity.Dgns;
import com.hivibe.server.domain.entity.Anls;
import lombok.Getter;

@Getter
public class DiagnosisDetailDto {
    private String name;
    private String lang;
    private String content;
    // AI 결과 추가
    private int totalScore;
    private int accuracy;
    private String accuracyReason;
    private int efficiency;
    private String efficiencyReason;
    private int readability;
    private String readabilityReason;
    private int style;
    private String styleReason;
    private String complexity;
    private String summary;

    public DiagnosisDetailDto(Dgns dgns) {
        Anls anls = dgns.getAnls();

        this.name = dgns.getDgnsNm();
        this.lang = anls.getOrnCd().getLang();
        this.content = anls.getOrnCd().getCdCn();

        this.totalScore = anls.getCdScr() != null ? anls.getCdScr() : 0;
        this.accuracy = anls.getCdScr() != null ? anls.getCdScr() : 0;
        this.accuracyReason = anls.getCdAccRsn();
        this.efficiency = parseIntSafe(anls.getCdEfcn());
        this.efficiencyReason = anls.getCdEfcnRsn();
        this.readability = parseIntSafe(anls.getCdRead());
        this.readabilityReason = anls.getCdReadRsn();
        this.style = parseIntSafe(anls.getCdSytle());
        this.styleReason = anls.getCdStyleRsn();
        this.complexity = anls.getTimeComp();
        this.summary = anls.getAiSummry();
    }

    private int parseIntSafe(String val) {
        try {
            return Integer.parseInt(val);
        } catch (Exception e) {
            return 0;
        }
    }
}