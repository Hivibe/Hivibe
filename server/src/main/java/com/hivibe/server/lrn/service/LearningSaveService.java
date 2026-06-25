package com.hivibe.server.lrn.service;

import com.hivibe.server.domain.entity.*;
import com.hivibe.server.lrn.dto.LearningSaveRequestDto;
import com.hivibe.server.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LearningSaveService {

    private final DgnsRepository dgnsRepository;
    private final LrnRepository lrnRepository;
    private final OptCdRepository optCdRepository;
    private final ConceptRepository conceptRepository;

    @Transactional
    public Long save(LearningSaveRequestDto request, User currentUser) {
        Dgns dgns = dgnsRepository.findById(request.diagnosisId())
            .orElseThrow(() -> new IllegalArgumentException(
                "진단을 찾을 수 없습니다: " + request.diagnosisId()));

        if (!dgns.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("본인의 진단이 아닙니다.");
        }

        Anls anls = dgns.getAnls();
        OptCd optCd = optCdRepository.findByAnls_AnlsId(anls.getAnlsId())
            .orElseThrow(() -> new IllegalStateException(
                "최적화 코드를 찾을 수 없습니다. anlsId=" + anls.getAnlsId()));

        if (request.optimizedCode() != null && request.optimizedCode().blank() != null) {
            optCd.updateBlank(request.optimizedCode().blank());
        }

        OrnCd ornCd = anls.getOrnCd();

        Lrn lrn = Lrn.builder()
            .user(currentUser)
            .optCd(optCd)
            .ornCd(ornCd)
            .lrnName(request.name())
            .tag(request.tags())
            .build();
        Lrn savedLrn = lrnRepository.save(lrn);

        if (request.concepts() != null) {
            int idx = 1;
            for (LearningSaveRequestDto.Concept c : request.concepts()) {
                Concept concept = Concept.builder()
                    .lrn(savedLrn)
                    .cdType(c.type())
                    .concTitle(c.title())
                    .concDesc(c.description())
                    .refUrl(c.referenceUrl())
                    .sortOrd(c.sortOrder() != null ? c.sortOrder() : idx)
                    .build();
                conceptRepository.save(concept);
                idx++;
            }
        }

        return savedLrn.getLrnId();
    }
}