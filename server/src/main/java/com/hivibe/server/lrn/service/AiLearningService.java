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

        // 2. Gemini 호출 (blank + concepts만 생성)
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

        // 3. 명세 형식으로 조립 (optimizedCode.content는 DB값 사용)
        AiLearningResponseDto.OptimizedCodeDto optimizedCodeDto = new AiLearningResponseDto.OptimizedCodeDto(
                optCd.getLang(),
                optCd.getCdCn(), // ← DB의 최적화 코드 그대로
                aiResult.blank(), // ← AI가 새로 만든 빈칸 코드
                optCd.getTimeComp());

        return new AiLearningResponseDto(optimizedCodeDto, aiResult.concepts());
    }

    private String buildPrompt(String lang, String originalCode, String optimizedCode) {
        return """
                당신은 주니어 개발자 학습 콘텐츠 AI입니다.
                아래 원본 코드와 이미 생성된 최적화 코드를 바탕으로,
                "빈칸 학습용 코드"와 "학습 개념 카드"를 만드세요.
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
                   - 단순 변수명이나 출력문은 뚫지 말 것
                   - 들여쓰기/줄바꿈 유지

                2. concepts: 학습 개념 카드
                   - type "O": 원본 코드에서 사용된 비효율적 개념 (1~2개)
                   - type "P": 최적화 코드에서 도입된 개선 개념 (2~3개)
                   - title: 50자 이내, description: 2~3문장
                   - referenceUrl: 공식 문서나 신뢰할 자료 URL (없으면 빈 문자열)

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
                  ]
                }
                """.formatted(lang, originalCode, optimizedCode);
    }

    /** Gemini 응답 파싱 전용 내부 DTO (optimizedCode 없음) */
    private record AiContentResult(
            String blank,
            List<AiLearningResponseDto.ConceptDto> concepts) {
    }
}
