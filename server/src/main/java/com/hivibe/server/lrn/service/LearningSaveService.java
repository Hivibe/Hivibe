package com.hivibe.server.lrn.service;

import com.hivibe.server.domain.entity.*;
import com.hivibe.server.domain.enums.UserGrd;
import com.hivibe.server.lrn.dto.LearningSaveRequestDto;
import com.hivibe.server.lrn.dto.LearningSaveResponseDto;
import com.hivibe.server.repository.*;
import com.hivibe.server.user.dto.TierUpDto;
import com.hivibe.server.user.service.UserGrdService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LearningSaveService {

    private final DgnsRepository dgnsRepository;
    private final LrnRepository lrnRepository;
    private final OptCdRepository optCdRepository;
    private final ConceptRepository conceptRepository;
    private final LrnBlankRepository lrnBlankRepository;
    private final UserGrdService userGrdService;

    @Transactional
    public LearningSaveResponseDto save(LearningSaveRequestDto request, User currentUser) {
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

        // 1. 학습 세션 저장
        Lrn lrn = Lrn.builder()
            .user(currentUser)
            .optCd(optCd)
            .ornCd(ornCd)
            .lrnName(request.name())
            .tag(request.tags())
            .build();
        Lrn savedLrn = lrnRepository.save(lrn);

        // 2. 개념 저장 (인덱스 순서대로 리스트에 보관 → 빈칸 매핑용)
        List<Concept> savedConcepts = new ArrayList<>();
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
                savedConcepts.add(conceptRepository.save(concept));
                idx++;
            }
        }

        // 3. 빈칸 정답 저장 (채점 기준)
        if (request.blanks() != null && !request.blanks().isEmpty()) {
            for (LearningSaveRequestDto.Blank b : request.blanks()) {
                if (b.order() == null || b.answer() == null || b.answer().isBlank()) {
                    log.warn("빈칸 정답 누락으로 스킵. lrnId={}, order={}", savedLrn.getLrnId(), b.order());
                    continue;
                }

                Concept linked = resolveConcept(savedConcepts, b.conceptIndex());

                LrnBlank blank = LrnBlank.builder()
                    .lrn(savedLrn)
                    .blankOrd(b.order())
                    .expAns(b.answer().trim())
                    .concept(linked)
                    .build();
                lrnBlankRepository.save(blank);
            }
            log.info("빈칸 {}개 저장 완료. lrnId={}", request.blanks().size(), savedLrn.getLrnId());
        } else {
            log.warn("빈칸 정답이 없습니다. 채점 불가 상태. lrnId={}", savedLrn.getLrnId());
        }

        // 4. 사용자 등급 재계산
         lrnRepository.flush();
        UserGrd upgraded = userGrdService.recalculate(currentUser.getId());

        return new LearningSaveResponseDto(
                "학습이 저장되었습니다.",
                savedLrn.getLrnId(),
                upgraded == null ? null : TierUpDto.from(upgraded));
    }
    
    /** conceptIndex(0-based)로 저장된 Concept 찾기. 범위 밖이면 null */
    private Concept resolveConcept(List<Concept> savedConcepts, Integer conceptIndex) {
        if (conceptIndex == null) return null;
        if (conceptIndex < 0 || conceptIndex >= savedConcepts.size()) {
            log.warn("conceptIndex 범위 초과: {}, size={}", conceptIndex, savedConcepts.size());
            return null;
        }
        return savedConcepts.get(conceptIndex);
    }
}