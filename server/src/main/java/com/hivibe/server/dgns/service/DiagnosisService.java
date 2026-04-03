package com.hivibe.server.dgns.service;

import com.hivibe.server.common.domain.entity.Anls;
import com.hivibe.server.common.domain.entity.OptCd;
import com.hivibe.server.common.domain.entity.OrnCd;
import com.hivibe.server.dgns.dto.DiagnosisSaveRequestDto;
import com.hivibe.server.repository.AnlsRepository;
import com.hivibe.server.repository.OptCdRepository;
import com.hivibe.server.repository.OrnCdRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DiagnosisService {

    private final OrnCdRepository ornCdRepository;
    private final AnlsRepository anlsRepository;
    private final OptCdRepository optCdRepository;

    @Transactional
    public Long saveDiagnosis(DiagnosisSaveRequestDto request) {

        // 1. 원본 코드 저장
        OrnCd ornCd = OrnCd.builder()
            .cdName(request.name())
            .lang(request.lang())
            .stbltYn(request.isStable())
            .cdCn(request.content())
            .build();

        OrnCd savedOrnCd = ornCdRepository.save(ornCd);

        // 2. 분석 결과 저장
        Anls anls = Anls.builder()
            .ornCd(savedOrnCd)
            .cdGrd(request.grade())
            .cdScr(request.score())
            .cdEfcn(String.valueOf(request.efficiency()))
            .cdRead(String.valueOf(request.readability()))
            .cdStyle(String.valueOf(request.style()))
            .timeComp(request.timeComplexity())
            .cdEfcnRsn(request.efficiencyReason())
            .cdAccRsn(request.accuracyReason())
            .cdReadRsn(request.readabilityReason())
            .cdSytleRsn(request.styleReason())
            .aiSummry(request.summary())
            .build();

        Anls savedAnls = anlsRepository.save(anls);

        // 3. 최적화 코드 저장
        OptCd optCd = OptCd.builder()
            .anls(savedAnls)
            .lang(request.lang())
            .cdCn(request.optimizedCode())
            .timeComp(request.timeComplexity())
            .build();

        optCdRepository.save(optCd);

        return savedAnls.getAnlsId();
    }
}