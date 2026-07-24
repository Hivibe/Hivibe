package com.hivibe.server.lrn.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hivibe.server.domain.entity.Lrn;
import com.hivibe.server.domain.entity.LrnDraft;
import com.hivibe.server.domain.entity.User;
import com.hivibe.server.lrn.dto.DraftResponseDto;
import com.hivibe.server.lrn.dto.DraftSaveRequestDto;
import com.hivibe.server.repository.LrnDraftRepository;
import com.hivibe.server.repository.LrnRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LrnDraftService {

    private final LrnDraftRepository lrnDraftRepository;
    private final LrnRepository lrnRepository;
    private final ObjectMapper objectMapper;

    /**
     * 임시 답안 저장 (upsert)
     * - 학습당 1행만 유지하므로 기존 행이 있으면 덮어씀
     */
    @Transactional
    public void save(Long lrnId, DraftSaveRequestDto request, User user) {
        Lrn lrn = findOwnedLrn(lrnId, user);

        String json = toJson(request.answers());

        lrnDraftRepository.findByLrn_LrnId(lrnId)
            .ifPresentOrElse(
                draft -> draft.updateAnswers(json),
                () -> lrnDraftRepository.save(
                    LrnDraft.builder()
                        .lrn(lrn)
                        .answers(json)
                        .build()
                )
            );
    }

    /**
     * 임시 답안 조회
     * - 저장된 draft가 없으면 null (컨트롤러에서 204 처리)
     */
    @Transactional(readOnly = true)
    public DraftResponseDto find(Long lrnId, User user) {
        findOwnedLrn(lrnId, user);

        return lrnDraftRepository.findByLrn_LrnId(lrnId)
            .map(d -> new DraftResponseDto(toMap(d.getAnswers()), d.getUpdatedAt()))
            .orElse(null);
    }

    /** 임시 답안 삭제 */
    @Transactional
    public void delete(Long lrnId, User user) {
        findOwnedLrn(lrnId, user);
        lrnDraftRepository.deleteByLrn_LrnId(lrnId);
    }

    // ─────────── 내부 ───────────

    /** 학습 조회 + 소유권 검증 */
    private Lrn findOwnedLrn(Long lrnId, User user) {
        Lrn lrn = lrnRepository.findById(lrnId)
            .orElseThrow(() -> new IllegalArgumentException("학습을 찾을 수 없습니다."));

        if (!lrn.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("접근 권한이 없습니다.");
        }
        return lrn;
    }

    private String toJson(Map<String, String> answers) {
        if (answers == null || answers.isEmpty()) return "{}";
        try {
            return objectMapper.writeValueAsString(answers);
        } catch (Exception e) {
            log.error("draft 직렬화 실패", e);
            throw new IllegalStateException("답안을 저장할 수 없습니다.");
        }
    }

    private Map<String, String> toMap(String json) {
        if (json == null || json.isBlank()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            log.warn("draft 역직렬화 실패, 빈 답안으로 처리: {}", json, e);
            return Collections.emptyMap();
        }
    }
}