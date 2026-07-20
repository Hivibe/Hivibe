package com.hivibe.server.lrn.service;

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

    /**
     * 아카이브 목록 (최신순)
     */
    @Transactional(readOnly = true)
    public List<LearningListItemDto> findAll(User currentUser) {
        List<Lrn> lrns = lrnRepository.findByUser_IdOrderByCreatedAtDesc(currentUser.getId());

        return lrns.stream()
            .map(lrn -> new LearningListItemDto(
                lrn.getLrnId(),
                lrn.getLrnName(),
                lrn.getCreatedAt(),
                lrn.getGrade(),
                lrn.getOptCd().getLang(),      // LAZY → @Transactional 안이라 OK
                lrn.getTag(),
                "Y".equals(lrn.getBkmkYn()),
                lrn.getStat(),
                lrn.getProgRt()
            ))
            .toList();
    }

    /**
     * 학습 상세
     * - 빈칸 코드 + 개념 + 원본 코드
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

        List<Concept> concepts = conceptRepository.findByLrn_LrnIdOrderBySortOrdAsc(lrnId);

        List<LearningDetailResponseDto.ConceptDto> conceptDtos = concepts.stream()
            .map(c -> new LearningDetailResponseDto.ConceptDto(
                c.getCdType(),
                c.getConcTitle(),
                c.getConcDesc(),
                c.getRefUrl(),
                c.getSortOrd()
            ))
            .toList();

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
            new LearningDetailResponseDto.OptimizedCodeDto(
                optCd.getLang(),
                optCd.getCdCn(),
                optCd.getBlank(),
                optCd.getTimeComp()
            ),
            conceptDtos
        );
    }

    /**
     * 즐겨찾기 토글
     */
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

    /**
     * 학습 세션 삭제
     * - 삭제 순서: LrnSubm → LrnBlank → Concept → Lrn
     *   (LrnSubm이 LrnBlank를 참조, LrnBlank가 Concept를 참조하므로 역순)
     * - OptCd/OrnCd/Anls/Dgns는 진단 소유라 남겨둠
     */
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
}