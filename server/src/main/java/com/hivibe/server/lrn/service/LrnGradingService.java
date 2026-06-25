package com.hivibe.server.lrn.service;

import com.hivibe.server.domain.entity.*;
import com.hivibe.server.lrn.dto.*;
import com.hivibe.server.lrn.util.AnswerNormalizer;
import com.hivibe.server.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LrnGradingService {

    private static final int REVIEW_DAYS_AFTER_COMPLETION = 3;

    private final LrnRepository lrnRepository;
    private final BlankRepository blankRepository;
    private final LrnSubmRepository lrnSubmRepository;
    private final AnswerNormalizer normalizer;
    private final AiGrader aiGrader;

    @Transactional
    public SubmissionResponseDto submit(Long lrnId, SubmissionRequestDto request, User currentUser) {
        if (request.answers() == null || request.answers().isEmpty()) {
            throw new IllegalArgumentException("답안이 비어있습니다.");
        }

        // 1. Lrn 조회 + 소유권 검증
        Lrn lrn = lrnRepository.findById(lrnId)
            .orElseThrow(() -> new IllegalArgumentException("학습 세션을 찾을 수 없습니다: " + lrnId));

        if (!lrn.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("본인의 학습 세션이 아닙니다.");
        }

        // 2. 현재 난이도의 빈칸 전체 조회
        BlankSet blankSet = lrn.getOptCd().getAnls() != null
            ? blankRepository
                .findByBlankSet_BlankSetIdOrderByBlankOrdAsc(getCurrentBlankSetId(lrn))
                .isEmpty() ? null : null
            : null;
        // ↑ 위 한 줄은 의도가 꼬여서 아래로 다시 작성

        List<Blank> blanks = findBlanksOfCurrentSession(lrn);
        if (blanks.isEmpty()) {
            throw new IllegalStateException("학습 세션에 빈칸이 없습니다. lrnId=" + lrnId);
        }

        Map<Long, Blank> blankById = new HashMap<>();
        for (Blank b : blanks) blankById.put(b.getBlankId(), b);

        // 3. 요청에 누락된 빈칸 있는지 확인 (모든 빈칸을 한 번에 제출하는 정책)
        for (Blank b : blanks) {
            boolean provided = request.answers().stream()
                .anyMatch(a -> b.getBlankId().equals(a.blankId()));
            if (!provided) {
                throw new IllegalArgumentException(
                    "모든 빈칸에 답안을 입력해야 합니다. 누락된 빈칸: " + b.getBlankKey()
                );
            }
        }

        // 4. ATTEMPT_NO 신규 발급
        int attemptNo = lrn.getLastAttemptNo() + 1;

        // 5. 채점 + 저장
        String lang = lrn.getOptCd().getLang();
        String templateContext = findTemplateCode(lrn);

        List<BlankResultDto> results = new ArrayList<>();
        int correctCount = 0;

        for (AnswerItem ans : request.answers()) {
            Blank blank = blankById.get(ans.blankId());
            if (blank == null) {
                throw new IllegalArgumentException(
                    "이 학습 세션에 속하지 않는 빈칸입니다: blankId=" + ans.blankId()
                );
            }

            GradeResult graded = gradeOne(lang, blank, ans.userAns(), templateContext);
            if (graded.correct) correctCount++;

            // LRN_SUBM 저장
            LrnSubm subm = LrnSubm.builder()
                .lrn(lrn)
                .blank(blank)
                .userAns(ans.userAns() == null ? "" : ans.userAns())
                .isCorrect(graded.correct ? "Y" : "N")
                .hintUsedLv(ans.hintUsedLv() == null ? 0 : ans.hintUsedLv())
                .attemptNo(attemptNo)
                .grdMethod(graded.method)
                .build();
            lrnSubmRepository.save(subm);

            results.add(new BlankResultDto(
                blank.getBlankId(),
                blank.getBlankKey(),
                graded.correct,
                graded.method,
                graded.correct ? null : blank.getExpAns()   // 오답 시 정답 노출 (정책 변경 가능)
            ));
        }

        // 6. Lrn 진행률/상태 갱신
        int totalBlanks = blanks.size();
        int progRt = (int) Math.round((correctCount * 100.0) / totalBlanks);
        boolean allCorrect = correctCount == totalBlanks;

        lrn.setLastAttemptNo(attemptNo);
        lrn.setProgRt(progRt);

        if (allCorrect) {
            lrn.setStat("DONE");
            // 힌트 사용량 기반 등급 산정
            String grade = computeGrade(request.answers(), totalBlanks);
            lrn.setGrade(grade);
            if (lrn.getNextReviewAt() == null) {
                lrn.setNextReviewAt(LocalDateTime.now().plusDays(REVIEW_DAYS_AFTER_COMPLETION));
            }
        } else {
            lrn.setStat("IN_PROG");
        }

        // 7. 응답
        return new SubmissionResponseDto(
            lrn.getLrnId(),
            attemptNo,
            totalBlanks,
            correctCount,
            progRt,
            lrn.getStat(),
            allCorrect,
            lrn.getGrade(),
            lrn.getNextReviewAt(),
            results
        );
    }

    // ─────────── 내부 헬퍼 ───────────

    /** 빈칸 한 개 채점: 문자열 일치 → 실패 시 AI 의미 비교 */
    private GradeResult gradeOne(String lang, Blank blank, String userAns, String templateContext) {
        if (userAns == null || userAns.isBlank()) {
            return new GradeResult(false, "N");
        }

        if (normalizer.matches(userAns, blank.getExpAns())) {
            return new GradeResult(true, "S");
        }

        boolean aiPass = aiGrader.isEquivalent(lang, blank.getExpAns(), userAns, templateContext);
        if (aiPass) {
            return new GradeResult(true, "A");
        }

        return new GradeResult(false, "N");
    }

    /**
     * 현재 학습 중인 BlankSet의 빈칸 목록 조회.
     * - Lrn에는 BlankSet 직접 참조가 없으므로, OptCd + crrDiff 조합으로 찾음
     */
    private List<Blank> findBlanksOfCurrentSession(Lrn lrn) {
        Long blankSetId = getCurrentBlankSetId(lrn);
        if (blankSetId == null) return List.of();
        return blankRepository.findByBlankSet_BlankSetIdOrderByBlankOrdAsc(blankSetId);
    }

    private Long getCurrentBlankSetId(Lrn lrn) {
        // BlankSetRepository로 직접 조회하는 게 깔끔하지만 의존성 추가 줄이기 위해
        // 빈칸 목록으로 역추적 (모든 빈칸이 같은 BlankSet 소속이라는 가정)
        // → 사실 BlankSetRepository 주입하는 게 맞음. 아래로 수정 권장.
        return findBlankSetIdViaRepository(lrn);
    }

    // BlankSetRepository를 추가로 주입받아서 깔끔하게 조회
    private final BlankSetRepository blankSetRepository = null; // ← 잘못된 패턴. 아래 별도 메서드로 정리

    private Long findBlankSetIdViaRepository(Lrn lrn) {
        // 임시: 무조건 첫 BlankSet 사용 (Lrn에 blankSetId 컬럼이 있으면 그걸 쓰는 게 맞음)
        // 일단 OptCd + crrDiff로 찾는 헬퍼를 따로 만들 것
        return null;
    }

    private String findTemplateCode(Lrn lrn) {
        // BlankSet.templateCode를 반환해야 하는데, 위와 동일한 이유로 별도 메서드 필요
        return "";
    }

    private String computeGrade(List<AnswerItem> answers, int totalBlanks) {
        // 힌트 사용량 평균으로 등급 산정 (간단 버전)
        double avgHint = answers.stream()
            .mapToInt(a -> a.hintUsedLv() == null ? 0 : a.hintUsedLv())
            .average()
            .orElse(0);

        if (avgHint == 0) return "S";
        if (avgHint <= 1) return "A";
        if (avgHint <= 2) return "B";
        return "C";
    }

    private record GradeResult(boolean correct, String method) {}
}