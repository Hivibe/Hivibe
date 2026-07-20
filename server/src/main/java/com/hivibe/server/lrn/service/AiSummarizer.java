package com.hivibe.server.lrn.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hivibe.server.lrn.dto.SubmissionResponseDto.BlankResultDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 제출 전체에 대한 AI 총평 생성기
 * - 채점 1회당 Gemini 호출 1회
 * - 실패해도 채점 결과는 살려야 하므로 fail-safe
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiSummarizer {

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    private static final String PROMPT_TEMPLATE = """
        당신은 주니어 개발자를 가르치는 코딩 학습 멘토입니다.
        학습자가 빈칸 채우기 문제를 풀었습니다. 아래 채점 결과를 보고
        학습자에게 줄 총평을 작성하세요.

        [언어]
        %s

        [결과]
        %d개 중 %d개 정답

        [빈칸별 상세]
        %s

        === 총평 작성 규칙 ===
        - 2~3문장, 한국어, 주니어 개발자에게 말하듯이
        - 잘한 점을 먼저 짚고, 보완할 점을 이어서
        - 전부 정답이면: 어떤 개념을 잘 이해했는지 구체적으로 짚고,
          실무에서 한 단계 더 나아갈 팁을 하나 제시
        - 틀린 게 있으면: 어떤 개념이 부족했는지 짚고, 어떻게 접근하면 좋을지 안내
        - "잘 하셨습니다" 같은 공허한 칭찬 금지. 반드시 구체적인 개념/코드를 언급할 것
        - 학습자를 탓하거나 비난하지 말 것

        === 출력 ===
        반드시 아래 JSON만 출력 (마크다운/설명 금지):

        {
          "comment": "총평 2~3문장"
        }
        """;

    /**
     * 총평 생성
     * - 실패 시 null 반환 (채점 결과는 그대로 유지)
     */
    public String summarize(String lang, List<BlankResultDto> results, int correctCount, int totalBlanks) {
        try {
            String detail = buildDetail(results);
            String prompt = PROMPT_TEMPLATE.formatted(
                lang == null ? "Java" : lang,
                totalBlanks,
                correctCount,
                detail
            );

            String rawJson = geminiClient.generateJson(prompt);
            SummaryResult result = objectMapper.readValue(rawJson, SummaryResult.class);
            return result.comment();

        } catch (Exception e) {
            log.error("AI 총평 생성 실패 — 총평 없이 진행. lrnId 결과 {}/{}", correctCount, totalBlanks, e);
            return null;
        }
    }

    /** 빈칸별 결과를 프롬프트용 텍스트로 */
    private String buildDetail(List<BlankResultDto> results) {
        StringBuilder sb = new StringBuilder();
        for (BlankResultDto r : results) {
            sb.append("#").append(r.blankOrd()).append(" ");
            sb.append(r.correct() ? "[정답]" : "[오답]").append("\n");
            sb.append("  개념: ").append(r.conceptTitle() == null ? "없음" : r.conceptTitle()).append("\n");
            sb.append("  사용자 답: ").append(r.userAns()).append("\n");
            if (!r.correct() && r.expAns() != null) {
                sb.append("  모범답안: ").append(r.expAns()).append("\n");
            }
            if (r.diffNote() != null) {
                sb.append("  채점 메모: ").append(r.diffNote()).append("\n");
            }
            sb.append("\n");
        }
        return sb.toString();
    }

    /** Gemini 응답 파싱용 */
    private record SummaryResult(String comment) {}
}