package com.hivibe.server.lrn.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hivibe.server.domain.entity.Concept;
import com.hivibe.server.domain.entity.Lrn;
import com.hivibe.server.domain.entity.OptCd;
import com.hivibe.server.domain.entity.OrnCd;
import com.hivibe.server.domain.entity.User;
import com.hivibe.server.lrn.dto.LearningDetailResponseDto;
import com.hivibe.server.lrn.dto.LearningListItemDto;
import com.hivibe.server.repository.ConceptRepository;
import com.hivibe.server.repository.LrnBlankRepository;
import com.hivibe.server.repository.LrnRepository;
import com.hivibe.server.repository.LrnSubmRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 학습 조회 서비스
 * - 아카이브 목록 / 학습 상세
 * - AI 호출 없음
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LearningQueryService {

    private final LrnRepository lrnRepository;
    private final ConceptRepository conceptRepository;
    private final LrnBlankRepository lrnBlankRepository;
    private final LrnSubmRepository lrnSubmRepository;
    private final ObjectMapper objectMapper; // ← 추가 (RequiredArgsConstructor가 자동 주입)

    @Transactional(readOnly = true)
    public List<LearningListItemDto> findAll(User currentUser) {
        List<Lrn> lrns = lrnRepository.findByUser_IdOrderByCreatedAtDesc(currentUser.getId());

        return lrns.stream()
                .map(lrn -> {
                    String grade = resolveGrade(lrn);
                    return new LearningListItemDto(
                            lrn.getLrnId(),
                            lrn.getLrnName(),
                            lrn.getCreatedAt(),
                            grade,
                            lrn.getOptCd().getLang(),
                            lrn.getTag(),
                            "Y".equals(lrn.getBkmkYn()),
                            lrn.getStat(),
                            lrn.getProgRt());
                })
                .toList();
    }

    private String resolveGrade(Lrn lrn) {
        try {
            OptCd optCd = lrn.getOptCd();
            if (optCd != null && optCd.getAnls() != null) {
                String dgnsGrade = optCd.getAnls().getCdGrd();
                if (dgnsGrade != null && !dgnsGrade.isBlank()) {
                    return dgnsGrade;
                }
            }
        } catch (Exception e) {
            log.warn("진단 등급 조회 실패 lrnId={}: {}", lrn.getLrnId(), e.getMessage());
        }
        return lrn.getGrade();
    }

    /**
     * 학습 상세
     * - 빈칸 코드 + 개념 + 원본 코드 + 해제된 개념 목록
     */
    @Transactional(readOnly = true)
    public LearningDetailResponseDto findDetail(Long lrnId, User currentUser) {
        Lrn lrn = lrnRepository.findById(lrnId)
                .orElseThrow(() -> new IllegalArgumentException("학습 세션을 찾을 수 없습니다: " + lrnId));

        if (!lrn.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("본인의 학습 세션이 아닙니다.");
        }

        OptCd optCd = lrn.getOptCd();
        OrnCd ornCd = lrn.getOrnCd();

        String originalComplexity = optCd.getAnls() != null
                ? optCd.getAnls().getTimeComp()
                : "O(?)";

        List<Concept> concepts = conceptRepository.findByLrn_LrnIdOrderBySortOrdAsc(lrnId);

        List<LearningDetailResponseDto.ConceptDto> conceptDtos = concepts.stream()
                .map(c -> new LearningDetailResponseDto.ConceptDto(
                        c.getConcId(),
                        c.getCdType(),
                        c.getConcTitle(),
                        c.getConcDesc(),
                        c.getRefUrl(),
                        c.getSortOrd()))
                .toList();

        // ▼▼▼ 여기 안으로 이동 (findDetail 메서드 안, return 전) ▼▼▼
        List<Long> unlockedConceptIds = parseUnlockedIds(lrn.getUnlockedConcIds());
        // ▲▲▲

        return new LearningDetailResponseDto(
                lrn.getLrnId(),
                lrn.getLrnName(),
                lrn.getCreatedAt(),
                lrn.getGrade(),
                lrn.getStat(),
                lrn.getProgRt(),
                lrn.getLastAttemptNo(),
                "Y".equals(lrn.getBkmkYn()),
                lrn.getTag(),
                lrn.getOverallComment(),
                ornCd.getCdCn(),
                originalComplexity,
                optCd.getOptCdId(),

                new LearningDetailResponseDto.OptimizedCodeDto(
                        optCd.getLang(),
                        optCd.getCdCn(),
                        optCd.getBlank(),
                        optCd.getTimeComp()),
                conceptDtos,
                unlockedConceptIds // ← 추가된 인자
        );
    }

    /** unlockedConcIds(JSON 문자열) → List<Long> 파싱 */
    private List<Long> parseUnlockedIds(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            Long[] ids = objectMapper.readValue(json, Long[].class);
            return List.of(ids);
        } catch (Exception e) {
            log.warn("unlockedConcIds 파싱 실패, 빈 목록으로 처리: {}", json, e);
            return List.of();
        }
    }

    @Transactional
    public boolean toggleBookmark(Long lrnId, User currentUser) {
        Lrn lrn = lrnRepository.findById(lrnId)
                .orElseThrow(() -> new IllegalArgumentException("학습 세션을 찾을 수 없습니다: " + lrnId));

        if (!lrn.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("본인의 학습 세션이 아닙니다.");
        }

        boolean next = !"Y".equals(lrn.getBkmkYn());
        lrn.setBkmkYn(next ? "Y" : "N");
        return next;
    }

    @Transactional
    public void delete(Long lrnId, User currentUser) {
        Lrn lrn = lrnRepository.findById(lrnId)
                .orElseThrow(() -> new IllegalArgumentException("학습 세션을 찾을 수 없습니다: " + lrnId));

        if (!lrn.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("본인의 학습 세션이 아닙니다.");
        }

        lrnSubmRepository.deleteByLrnId(lrnId);
        lrnBlankRepository.deleteByLrnId(lrnId);
        conceptRepository.deleteByLrnId(lrnId);
        lrnRepository.delete(lrn);

        log.info("학습 세션 삭제 완료. lrnId={}", lrnId);
    }

    @Transactional
    public void rename(Long lrnId, String newName, User currentUser) {
        Lrn lrn = lrnRepository.findById(lrnId)
                .orElseThrow(() -> new IllegalArgumentException("학습 세션을 찾을 수 없습니다: " + lrnId));

        if (!lrn.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("본인의 학습 세션이 아닙니다.");
        }

        String trimmed = newName == null ? "" : newName.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("학습 이름은 비워둘 수 없습니다.");
        }
        lrn.setLrnName(trimmed);
        lrnRepository.save(lrn);
    }
}