package com.hivibe.server.lrn.service;

import com.hivibe.server.domain.entity.Concept;
import com.hivibe.server.domain.entity.Lrn;
import com.hivibe.server.domain.entity.LrnBlank;
import com.hivibe.server.domain.entity.User;
import com.hivibe.server.lrn.dto.HintResponseDto;
import com.hivibe.server.repository.LrnBlankRepository;
import com.hivibe.server.repository.LrnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 계층적 힌트 서비스
 * - Lv1: 개념명 / Lv2: 개념 설명 / Lv3: 정답 일부 마스킹 노출
 * - Lv3는 정답 원문을 그대로 내려주지 않고 서버에서 마스킹해서 반환 (정답 유출 방지)
 */
@Service
@RequiredArgsConstructor
public class LrnHintService {

    private static final double REVEAL_RATIO = 0.3;

    private final LrnRepository lrnRepository;
    private final LrnBlankRepository lrnBlankRepository;

    @Transactional(readOnly = true)
    public HintResponseDto getHint(Long lrnId, Integer blankOrd, Integer level, User currentUser) {

        if (level == null || level < 1 || level > 3) {
            throw new IllegalArgumentException("힌트 레벨은 1~3 사이여야 합니다.");
        }

        Lrn lrn = lrnRepository.findById(lrnId)
            .orElseThrow(() -> new IllegalArgumentException("학습 세션을 찾을 수 없습니다: " + lrnId));

        if (!lrn.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("본인의 학습 세션이 아닙니다.");
        }

        LrnBlank blank = lrnBlankRepository.findByLrn_LrnIdAndBlankOrd(lrnId, blankOrd)
            .orElseThrow(() -> new IllegalArgumentException("빈칸을 찾을 수 없습니다: #" + blankOrd));

        Concept concept = blank.getConcept();

        String content = switch (level) {
            case 1 -> concept != null ? concept.getConcTitle() : "이 빈칸에는 연결된 개념이 없어요.";
            case 2 -> concept != null && concept.getConcDesc() != null
                ? concept.getConcDesc()
                : "설명이 준비되지 않았어요.";
            case 3 -> maskAnswer(blank.getExpAns());
            default -> throw new IllegalStateException("unreachable");
        };

        return new HintResponseDto(level, content);
    }

    /**
     * 정답 앞부분만 노출하고 나머지는 마스킹.
     * 공백/괄호/세미콜론 등 구조 문자는 그대로 둬서 형태는 유추 가능하게.
     */
    private String maskAnswer(String expAns) {
        if (expAns == null || expAns.isBlank()) return "";

        int len = expAns.length();
        int revealCount = Math.max(1, (int) Math.ceil(len * REVEAL_RATIO));

        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            char c = expAns.charAt(i);
            boolean structural = Character.isWhitespace(c) || "(){}[];,.".indexOf(c) >= 0;
            if (i < revealCount || structural) {
                sb.append(c);
            } else {
                sb.append('•');
            }
        }
        return sb.toString();
    }
}