package com.hivibe.server.lrn.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hivibe.server.domain.entity.Anls;
import com.hivibe.server.domain.entity.Dgns;
import com.hivibe.server.domain.entity.OptCd;
import com.hivibe.server.domain.entity.OrnCd;
import com.hivibe.server.lrn.dto.AiLearningRequestDto;
import com.hivibe.server.lrn.dto.AiLearningResponseDto;
import com.hivibe.server.repository.DgnsRepository;
import com.hivibe.server.repository.OptCdRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiLearningService {

    private final DgnsRepository dgnsRepository;
    private final OptCdRepository optCdRepository;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public AiLearningResponseDto generate(AiLearningRequestDto request) {
        // 1. Dgns → Anls → OptCd, OrnCd 조회
        Dgns dgns = dgnsRepository.findById(request.diagnosisId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "진단을 찾을 수 없습니다: " + request.diagnosisId()));

        Anls anls = dgns.getAnls();
        OrnCd ornCd = anls.getOrnCd();

        OptCd optCd = optCdRepository.findByAnls_AnlsId(anls.getAnlsId())
                .orElseThrow(() -> new IllegalStateException(
                        "최적화 코드를 찾을 수 없습니다. anlsId=" + anls.getAnlsId()));

        // 2. Gemini 호출 (blank + concepts + blanks 생성)
        String prompt = buildPrompt(
                optCd.getLang(),
                ornCd.getCdCn(),
                optCd.getCdCn());
        String rawJson = geminiClient.generateJson(prompt);

        AiContentResult aiResult;
        try {
            aiResult = objectMapper.readValue(rawJson, AiContentResult.class);
        } catch (Exception e) {
            log.error("Gemini 응답 파싱 실패. raw={}", rawJson, e);
            throw new RuntimeException("AI 응답 파싱 실패", e);
        }

        // 3. 빈칸 마커와 정답 개수 일치 검증
        validateBlanks(aiResult.blank(), aiResult.blanks());

        // 4. 명세 형식으로 조립 (optimizedCode.content는 DB값 사용)
        AiLearningResponseDto.OptimizedCodeDto optimizedCodeDto = new AiLearningResponseDto.OptimizedCodeDto(
                optCd.getLang(),
                optCd.getCdCn(), // ← DB의 최적화 코드 그대로
                aiResult.blank(), // ← AI가 새로 만든 빈칸 코드
                optCd.getTimeComp());

        return new AiLearningResponseDto(
                optimizedCodeDto,
                aiResult.concepts(),
                aiResult.blanks());
    }

    /**
     * blank 코드의 {{BLANK_N}} 마커와 blanks 배열이 일치하는지 검증
     * - AI가 마커는 3개 뚫었는데 정답은 2개만 주는 경우 방지
     */
    private void validateBlanks(String blankCode, List<AiLearningResponseDto.BlankDto> blanks) {
        if (blankCode == null || blanks == null || blanks.isEmpty()) {
            throw new IllegalStateException("AI가 빈칸 또는 정답을 생성하지 못했습니다.");
        }

        java.util.Set<Integer> markerOrders = new java.util.HashSet<>();
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("\\{\\{BLANK_(\\d+)\\}\\}")
                .matcher(blankCode);
        while (m.find()) {
            markerOrders.add(Integer.parseInt(m.group(1)));
        }

        java.util.Set<Integer> answerOrders = new java.util.HashSet<>();
        for (AiLearningResponseDto.BlankDto b : blanks) {
            if (b.order() == null || b.answer() == null || b.answer().isBlank()) {
                throw new IllegalStateException("빈칸 정답이 비어있습니다: order=" + b.order());
            }
            answerOrders.add(b.order());
        }

        if (!markerOrders.equals(answerOrders)) {
            log.error("빈칸 마커/정답 불일치. markers={}, answers={}", markerOrders, answerOrders);
            throw new IllegalStateException(
                    "AI가 생성한 빈칸 마커와 정답 개수가 맞지 않습니다. 다시 시도해 주세요.");
        }
    }

    private String buildPrompt(String lang, String originalCode, String optimizedCode) {
        return """
                당신은 주니어 개발자 학습 콘텐츠 AI입니다.
                아래 원본 코드와 이미 생성된 최적화 코드를 바탕으로,
                "빈칸 학습용 코드"와 "학습 개념 카드", 그리고 "빈칸별 정답"을 만드세요.
                (최적화 코드 자체는 절대 수정하지 마세요. 이미 확정된 코드입니다.)

                [언어]
                %s

                [원본 코드]

                %s

                [최적화 코드]

                %s

                === 규칙 ===
                1. blank: 위 최적화 코드에서 핵심 로직 부분을 `{{BLANK_1}}`, `{{BLANK_2}}` 마커로 뚫은 학습용 코드
                   - 마커 외 부분은 최적화 코드와 100%% 동일
                   - 빈칸은 2~3개, 핵심 자료구조 선언이나 알고리즘 로직만 뚫기
                   - 들여쓰기/줄바꿈 유지
                   - 마커 번호는 1부터 순서대로, 중복 없이

                   [반드시 지킬 빈칸 선정 원칙]
                   - 학습자가 "무엇을 왜 이렇게 쓰는가"를 떠올려야 풀 수 있는 부분만 뚫을 것
                   - 다음은 절대 뚫지 말 것:
                     · 타입명 단독 (예: `StringBuilder`, `Map<String, Integer>` 만 뚫기 ✗)
                     · 변수 선언의 좌변 (예: `String result = ` 부분 ✗)
                     · 단순 변수명, 출력문, 주석
                     · return 키워드 자체
                   - 다음을 뚫을 것:
                     · 우변 표현식 전체 (예: `new StringBuilder()`, `sb.toString()`)
                     · 메서드 체이닝 (예: `sb.append(i).append(", ")`)
                     · 조건식, 반복 로직의 핵심부
                   - 나쁜 예: `{{BLANK_1}} sb = new StringBuilder();`  ← 타입명만 뚫음
                   - 좋은 예: `StringBuilder sb = {{BLANK_1}};`         ← 우변 표현식을 뚫음
                   - 나쁜 예: `{{BLANK_2}} = sb.toString();`            ← 좌변을 뚫음
                   - 좋은 예: `String result = {{BLANK_2}};`            ← 우변을 뚫음

                2. concepts: 학습 개념 카드
                   - type "O": 원본 코드에서 사용된 비효율적 개념 (1~2개)
                   - type "P": 최적화 코드에서 도입된 개선 개념 (2~3개)
                   - title: 50자 이내, description: 2~3문장
                   - referenceUrl: 공식 문서나 신뢰할 자료 URL (없으면 빈 문자열)

                3. blanks: 각 빈칸의 정답 (채점 기준이 되므로 정확해야 함)
                   - order: 마커 번호 ({{BLANK_1}}이면 1)
                   - answer: 해당 마커 자리에 원래 있던 최적화 코드의 텍스트를 **그대로** (앞뒤 공백 제외)
                   - answer에는 세미콜론(;)을 포함하지 말 것. 세미콜론은 blank 코드에 남겨둘 것
                   - conceptIndex: 이 빈칸을 이해하는 데 필요한 개념의 concepts 배열 인덱스 (0부터 시작).
                     주로 type "P" 개념을 연결. 마땅한 개념이 없으면 null
                   - blank의 마커 개수와 blanks 배열 길이는 반드시 일치해야 함
                   - 검증: blank의 {{BLANK_N}}을 blanks[N-1].answer로 치환하면 최적화 코드와 정확히 같아야 함

                === 출력 ===
                반드시 아래 JSON만 출력 (마크다운/주석/설명 금지):

                {
                  "blank": "{{BLANK_1}} 마커 박힌 학습용 코드",
                  "concepts": [
                    {
                      "type": "O",
                      "title": "개념 제목",
                      "description": "2~3 문장 설명",
                      "referenceUrl": "https://..."
                    }
                  ],
                  "blanks": [
                    {
                      "order": 1,
                      "answer": "마커 자리의 원래 코드",
                      "conceptIndex": 2
                    }
                  ]
                }
                """.formatted(lang, originalCode, optimizedCode);
    }

    /** Gemini 응답 파싱 전용 내부 DTO (optimizedCode 없음) */
    private record AiContentResult(
            String blank,
            List<AiLearningResponseDto.ConceptDto> concepts,
            List<AiLearningResponseDto.BlankDto> blanks) {
    }
}