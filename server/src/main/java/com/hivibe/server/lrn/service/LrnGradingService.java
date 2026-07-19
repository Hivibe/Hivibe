package com.hivibe.server.lrn.service;

import com.hivibe.server.domain.entity.*;
import com.hivibe.server.lrn.dto.AiGradeResult;
import com.hivibe.server.lrn.dto.SubmissionRequestDto;
import com.hivibe.server.lrn.dto.SubmissionRequestDto.AnswerItem;
import com.hivibe.server.lrn.dto.SubmissionResponseDto;
import com.hivibe.server.lrn.dto.SubmissionResponseDto.BlankResultDto;
import com.hivibe.server.lrn.util.AnswerNormalizer;
import com.hivibe.server.repository.LrnBlankRepository;
import com.hivibe.server.repository.LrnRepository;
import com.hivibe.server.repository.LrnSubmRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 학습 채점 서비스
 * - 문자열 일치 → 실패 시 AI 의미 비교 폴백
 * - 정답이어도 차이점/추천사항 피드백 제공
 * - 제출 전체에 대한 AI 총평 1회 생성
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LrnGradingService {

    private static final int REVIEW_DAYS_AFTER_COMPLETION = 3;

    private final LrnRepository lrnRepository;
    private final LrnBlankRepository lrnBlankRepository;
    private final LrnSubmRepository lrnSubmRepository;
    private final AnswerNormalizer normalizer;
    private final AiGrader aiGrader;
    private final AiSummarizer aiSummarizer;

    @Transactional
    public SubmissionResponseDto submit(Long lrnId, SubmissionRequestDto request, User currentUser) {

        if (request.answers() == null || request.answers().isEmpty()) {
            throw new IllegalArgumentException("답안이 비어있습니다.");
        }

        // 1. 학습 세션 조회 + 소유권 검증
        Lrn lrn = lrnRepository.findById(lrnId)
            .orElseThrow(() -> new IllegalArgumentException("학습 세션을 찾을 수 없습니다: " + lrnId));

        if (!lrn.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("본인의 학습 세션이 아닙니다.");
        }

        // 2. 빈칸 전체 조회
        List<LrnBlank> blanks = lrnBlankRepository.findByLrnIdWithConcept(lrnId);
        if (blanks.isEmpty()) {
            throw new IllegalStateException("학습 세션에 빈칸이 없습니다. lrnId=" + lrnId);
        }

        Map<Integer, LrnBlank> blankByOrd = new HashMap<>();
        for (LrnBlank b : blanks) {
            blankByOrd.put(b.getBlankOrd(), b);
        }

        // 3. 누락된 빈칸 검증 (전체 제출 정책)
        for (LrnBlank b : blanks) {
            boolean provided = request.answers().stream()
                .anyMatch(a -> b.getBlankOrd().equals(a.blankOrd()));
            if (!provided) {
                throw new IllegalArgumentException(
                    "모든 빈칸에 답안을 입력해야 합니다. 누락된 빈칸: #" + b.getBlankOrd()
                );
            }
        }

        // 4. 시도 차수 발급
        int attemptNo = lrn.getLastAttemptNo() + 1;

        // 5. 채점
        String lang = lrn.getOptCd().getLang();
        String codeContext = lrn.getOptCd().getBlank();

        List<BlankResultDto> results = new ArrayList<>();
        int correctCount = 0;

        for (AnswerItem ans : request.answers()) {
            LrnBlank blank = blankByOrd.get(ans.blankOrd());
            if (blank == null) {
                throw new IllegalArgumentException(
                    "이 학습 세션에 없는 빈칸입니다: #" + ans.blankOrd()
                );
            }

            GradeResult graded = gradeOne(lang, blank, ans.userAns(), codeContext);
            if (graded.correct()) correctCount++;

            // 제출 이력 저장
            LrnSubm subm = LrnSubm.builder()
                .lrn(lrn)
                .blank(blank)
                .attemptNo(attemptNo)
                .userAns(ans.userAns() == null ? "" : ans.userAns())
                .isCorrect(graded.correct() ? "Y" : "N")
                .grdMethod(graded.method())
                .hintUsedLv(ans.hintUsedLv() == null ? 0 : ans.hintUsedLv())
                .diffNote(graded.diffNote())
                .recommend(graded.recommend())
                .securityNote(graded.securityNote())
                .build();
            lrnSubmRepository.save(subm);

            Concept concept = blank.getConcept();

            results.add(new BlankResultDto(
                blank.getBlankId(),
                blank.getBlankOrd(),
                ans.userAns(),
                graded.correct(),
                graded.method(),
                graded.correct() ? null : blank.getExpAns(),
                graded.diffNote(),
                graded.recommend(),
                graded.securityNote(),
                concept != null ? concept.getConcTitle() : null,
                concept != null ? concept.getConcDesc() : null
            ));
        }

        // 6. 진행률/상태 갱신
        int totalBlanks = blanks.size();
        int progRt = (int) Math.round((correctCount * 100.0) / totalBlanks);
        boolean allCorrect = correctCount == totalBlanks;

        lrn.setLastAttemptNo(attemptNo);
        lrn.setProgRt(progRt);

        if (allCorrect) {
            lrn.setStat("DONE");
            lrn.setGrade(computeGrade(request.answers()));
            if (lrn.getNextReviewAt() == null) {
                lrn.setNextReviewAt(LocalDateTime.now().plusDays(REVIEW_DAYS_AFTER_COMPLETION));
            }
        }  else {
            lrn.setStat("IN_PROG");
            lrn.setGrade(null);
            lrn.setNextReviewAt(null);
        }

        // 7. AI 총평 (호출 1회)
        String overallComment = aiSummarizer.summarize(lang, results, correctCount, totalBlanks);
        lrn.setOverallComment(overallComment);

        log.info("채점 완료 lrnId={}, attemptNo={}, {}/{} 정답", lrnId, attemptNo, correctCount, totalBlanks);

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
            overallComment,
            results
        );
    }

    // ─────────── 내부 ───────────

    private GradeResult gradeOne(String lang, LrnBlank blank, String userAns, String codeContext) {

        if (userAns == null || userAns.isBlank()) {
            return new GradeResult(false, "N", null, null, null);
        }

        // 1) 문자열 일치 → AI 호출 없음
        if (normalizer.matches(userAns, blank.getExpAns())) {
            return new GradeResult(true, "S", null, null, null);
        }

        // 2) AI 의미 비교
        AiGradeResult ai = aiGrader.grade(lang, blank.getExpAns(), userAns, codeContext);

        return new GradeResult(
            ai.equivalent(),
            ai.equivalent() ? "A" : "N",
            ai.diffNote(),
            ai.recommend(),
            ai.securityNote()
        );
    }

    private String computeGrade(List<AnswerItem> answers) {
        double avgHint = answers.stream()
            .mapToInt(a -> a.hintUsedLv() == null ? 0 : a.hintUsedLv())
            .average()
            .orElse(0);

        if (avgHint == 0) return "S";
        if (avgHint <= 1) return "A";
        if (avgHint <= 2) return "B";
        return "C";
    }

    private record GradeResult(
        boolean correct,
        String method,
        String diffNote,
        String recommend,
        String securityNote
    ) {}

    /**
     * 마지막 채점 결과 조회
     * - 아카이브에서 이미 푼 학습을 다시 열 때 답/피드백 복원용
     * - 제출 이력이 없으면 null (아직 안 푼 학습)
     */
    @Transactional(readOnly = true)
    public SubmissionResponseDto getLatestSubmission(Long lrnId, User currentUser) {
        Lrn lrn = lrnRepository.findById(lrnId)
            .orElseThrow(() -> new IllegalArgumentException("학습 세션을 찾을 수 없습니다: " + lrnId));

        if (!lrn.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("본인의 학습 세션이 아닙니다.");
        }

        int lastAttempt = lrn.getLastAttemptNo();
        if (lastAttempt <= 0) {
            return null;   // 아직 제출 안 함
        }

        // 마지막 시도의 제출 이력
        List<LrnSubm> subms = lrnSubmRepository
            .findByLrn_LrnIdAndAttemptNoOrderByBlank_BlankOrdAsc(lrnId, lastAttempt);

        if (subms.isEmpty()) {
            return null;
        }

        // 빈칸 개념 정보 (conceptTitle/Desc 채우기 위해)
        List<LrnBlank> blanks = lrnBlankRepository.findByLrnIdWithConcept(lrnId);
        Map<Long, LrnBlank> blankById = new HashMap<>();
        for (LrnBlank b : blanks) blankById.put(b.getBlankId(), b);

        List<BlankResultDto> results = new ArrayList<>();
        int correctCount = 0;

        for (LrnSubm s : subms) {
            boolean correct = "Y".equals(s.getIsCorrect());
            if (correct) correctCount++;

            LrnBlank blank = blankById.get(s.getBlank().getBlankId());
            Concept concept = blank != null ? blank.getConcept() : null;

            results.add(new BlankResultDto(
                s.getBlank().getBlankId(),
                s.getBlank().getBlankOrd(),
                s.getUserAns(),
                correct,
                s.getGrdMethod(),
                correct ? null : (blank != null ? blank.getExpAns() : null),
                s.getDiffNote(),
                s.getRecommend(),
                s.getSecurityNote(),
                concept != null ? concept.getConcTitle() : null,
                concept != null ? concept.getConcDesc() : null
            ));
        }

        int totalBlanks = blanks.size();
        boolean allCorrect = correctCount == totalBlanks;

        return new SubmissionResponseDto(
            lrn.getLrnId(),
            lastAttempt,
            totalBlanks,
            correctCount,
            lrn.getProgRt(),
            lrn.getStat(),
            allCorrect,
            lrn.getGrade(),
            lrn.getNextReviewAt(),
            lrn.getOverallComment(),
            results
        );
    }
}