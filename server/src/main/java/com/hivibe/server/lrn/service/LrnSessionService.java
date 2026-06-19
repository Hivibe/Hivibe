package com.hivibe.server.lrn.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hivibe.server.domain.entity.*;
import com.hivibe.server.lrn.dto.*;
import com.hivibe.server.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LrnSessionService {

    private final OptCdRepository optCdRepository;
    private final BlankSetRepository blankSetRepository;
    private final BlankRepository blankRepository;
    private final ConceptRepository conceptRepository;
    private final LrnRepository lrnRepository;
    private final GeminiClient geminiClient;
    private final BlankPromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;

    /**
     * 학습 세션 시작
     * - BlankSet 캐시 있으면 재사용, 없으면 AI 호출하여 생성
     * - Lrn은 항상 신규 생성
     */
    @Transactional
    public SessionResponseDto startSession(SessionCreateRequestDto req, User currentUser) {
        String difficulty = (req.difficulty() == null || req.difficulty().isBlank()) ? "M" : req.difficulty();
        validateDifficulty(difficulty);

        // 1. OptCd 조회
        OptCd optCd = optCdRepository.findById(req.optCdId())
            .orElseThrow(() -> new IllegalArgumentException("최적화 코드를 찾을 수 없습니다: " + req.optCdId()));

        OrnCd ornCd = optCd.getAnls().getOrnCd();
        if (ornCd == null) {
            throw new IllegalStateException("원본 코드 정보가 없습니다. optCdId=" + req.optCdId());
        }

        // 2. Lrn 신규 생성 (BlankSet 캐싱 여부와 무관하게 사용자별 세션은 새로 만듦)
        Lrn lrn = Lrn.builder()
            .user(currentUser)
            .optCd(optCd)
            .ornCd(ornCd)
            .lrnName(req.lrnName())
            .tag(req.tag())
            .crrDiff(difficulty)
            .build();
        lrn = lrnRepository.save(lrn);

        // 3. BlankSet 캐시 조회
        BlankSet blankSet = blankSetRepository
            .findByOptCd_OptCdIdAndDifficulty(optCd.getOptCdId(), difficulty)
            .orElse(null);

        List<Concept> concepts;

        if (blankSet == null) {
            // 4-1. 캐시 미스: AI 호출 → BlankSet/Blank 생성, Concept도 이번 Lrn에 생성
            BlankGenerationResult generated = generateBlanksAndConcepts(optCd, ornCd, difficulty, lrn);
            blankSet = generated.blankSet;
            concepts = generated.concepts;
        } else {
            // 4-2. 캐시 히트: BlankSet 재사용. Concept만 이번 Lrn에 복제 생성
            //      (Concept은 Lrn에 종속되므로 사용자별 Lrn마다 따로 가져야 함)
            concepts = cloneConceptsForLrn(blankSet, lrn);
        }

        // 5. 응답 DTO 변환
        return buildResponse(lrn, optCd, ornCd, blankSet, concepts);
    }

    // ─────────── 내부 헬퍼 ───────────

    private void validateDifficulty(String difficulty) {
        if (!List.of("E", "M", "H").contains(difficulty)) {
            throw new IllegalArgumentException("난이도는 E/M/H 중 하나여야 합니다: " + difficulty);
        }
    }

    /**
     * Gemini 호출하여 BlankSet, Blank, Concept 모두 신규 생성.
     */
    private BlankGenerationResult generateBlanksAndConcepts(OptCd optCd, OrnCd ornCd, String difficulty, Lrn lrn) {
        String prompt = promptBuilder.build(
            optCd.getLang(),
            ornCd.getCdCn(),
            optCd.getCdCn(),
            optCd.getAnls().getTimeComp(),
            optCd.getTimeComp(),
            difficulty
        );

        String rawJson = geminiClient.generateJson(prompt);

        GeminiBlankResultDto result;
        try {
            result = objectMapper.readValue(rawJson, GeminiBlankResultDto.class);
        } catch (Exception e) {
            log.error("Gemini 응답 파싱 실패. raw={}", rawJson, e);
            throw new RuntimeException("Gemini 응답 파싱 실패", e);
        }

        // BlankSet 저장
        BlankSet blankSet = BlankSet.builder()
            .optCd(optCd)
            .difficulty(difficulty)
            .templateCode(result.templateCode())
            .build();

        // Concept 저장 (이번 Lrn 소속, "P" 측 Concept을 먼저 만들어야 Blank에서 참조 가능)
        Map<String, Concept> conceptByTitle = new HashMap<>();
        for (GeminiBlankResultDto.ConceptItem ci : result.concepts()) {
            Concept c = Concept.builder()
                .lrn(lrn)
                .cdType(ci.cdType())
                .concTitle(ci.concTitle())
                .concDesc(ci.concDesc())
                .refUrl(ci.refUrl())
                .sortOrd(ci.sortOrd())
                .build();
            c = conceptRepository.save(c);
            conceptByTitle.put(ci.concTitle(), c);
        }

        // Blank 저장 (BlankSet에 양방향 add)
        for (GeminiBlankResultDto.BlankItem bi : result.blanks()) {
            Concept relatedConcept = (bi.relatedConceptTitle() != null)
                ? conceptByTitle.get(bi.relatedConceptTitle())
                : null;

            Blank blank = Blank.builder()
                .blankSet(blankSet)
                .concept(relatedConcept)
                .blankKey(bi.blankKey())
                .blankOrd(bi.blankOrd())
                .expAns(bi.expectedAnswer())
                .hintLv1(bi.hintLv1())
                .hintLv2(bi.hintLv2())
                .hintLv3(bi.hintLv3())
                .build();
            blankSet.addBlank(blank);
        }

        blankSet = blankSetRepository.save(blankSet);

        // OptCd.blank 필드도 최초 1회 채워두기 (있으면 그대로 둠)
        if (optCd.getBlank() == null || optCd.getBlank().isBlank()) {
            // OptCd는 @Setter 없음 → blank 필드 채울 방법이 없으면 SKIP.
            // 필요하면 OptCd에 setter 추가하거나, BlankSet.templateCode를 정본으로 사용.
            log.debug("OptCd.blank 필드는 BlankSet.templateCode로 대체됨 (Setter 없음).");
        }

        return new BlankGenerationResult(blankSet, List.copyOf(conceptByTitle.values()));
    }

    /**
     * 캐시 히트인 경우, Concept을 이번 Lrn에 새로 복제 생성.
     * - 원본 Lrn의 Concept을 그대로 가져올 수 없음 (Concept.lrn이 다른 Lrn을 가리킴)
     * - 같은 BlankSet을 사용하는 다른 Lrn의 Concept을 참조해서 동일한 내용으로 복제
     */
    private List<Concept> cloneConceptsForLrn(BlankSet blankSet, Lrn lrn) {
        // Blank → Concept 참조해서 P 측 Concept들 수집 + O 측은 별도 조회 필요.
        // 단순화: 같은 BlankSet의 가장 최근 Lrn에서 Concept 복제.
        // 더 깔끔한 방법: Concept을 OptCd 단위로 이동시키는 것이지만 현재 스키마는 LRN 종속이므로 복제로 처리.

        List<Blank> existingBlanks = blankRepository
            .findByBlankSet_BlankSetIdOrderByBlankOrdAsc(blankSet.getBlankSetId());

        if (existingBlanks.isEmpty()) {
            return List.of();
        }

        // 첫 Blank의 Concept이 가리키는 Lrn → 거기서 모든 Concept 가져옴
        Concept anyConcept = existingBlanks.stream()
            .map(Blank::getConcept)
            .filter(c -> c != null)
            .findFirst()
            .orElse(null);

        if (anyConcept == null) {
            return List.of();
        }

        List<Concept> sourceConcepts = conceptRepository
            .findByLrn_LrnIdOrderBySortOrdAsc(anyConcept.getLrn().getLrnId());

        List<Concept> cloned = new java.util.ArrayList<>();
        for (Concept src : sourceConcepts) {
            Concept copy = Concept.builder()
                .lrn(lrn)
                .cdType(src.getCdType())
                .concTitle(src.getConcTitle())
                .concDesc(src.getConcDesc())
                .refUrl(src.getRefUrl())
                .sortOrd(src.getSortOrd())
                .build();
            cloned.add(conceptRepository.save(copy));
        }
        return cloned;
    }

    /**
     * 최종 응답 DTO 조립.
     */
    private SessionResponseDto buildResponse(Lrn lrn, OptCd optCd, OrnCd ornCd,
                                              BlankSet blankSet, List<Concept> concepts) {
        List<Blank> blanks = blankRepository
            .findByBlankSet_BlankSetIdOrderByBlankOrdAsc(blankSet.getBlankSetId());

        List<BlankSummaryDto> blankDtos = blanks.stream()
            .map(b -> new BlankSummaryDto(
                b.getBlankId(),
                b.getBlankKey(),
                b.getBlankOrd(),
                b.getConcept() != null ? b.getConcept().getConcId() : null,
                b.getConcept() != null ? b.getConcept().getConcTitle() : null,
                b.getHintLv1() != null && !b.getHintLv1().isBlank(),
                b.getHintLv2() != null && !b.getHintLv2().isBlank(),
                b.getHintLv3() != null && !b.getHintLv3().isBlank()
            ))
            .toList();

        List<ConceptDto> conceptDtos = concepts.stream()
            .sorted(Comparator
                .comparing(Concept::getCdType)
                .thenComparing(c -> c.getSortOrd() == null ? 0 : c.getSortOrd()))
            .map(c -> new ConceptDto(
                c.getConcId(),
                c.getCdType(),
                c.getConcTitle(),
                c.getConcDesc(),
                c.getRefUrl(),
                c.getSortOrd()
            ))
            .toList();

        return new SessionResponseDto(
            lrn.getLrnId(),
            optCd.getOptCdId(),
            ornCd.getOrnCdId(),
            blankSet.getDifficulty(),
            optCd.getLang(),
            ornCd.getCdCn(),
            optCd.getCdCn(),
            blankSet.getTemplateCode(),
            blankDtos,
            conceptDtos
        );
    }

    /** 내부 전달용 record */
    private record BlankGenerationResult(BlankSet blankSet, List<Concept> concepts) {}
}