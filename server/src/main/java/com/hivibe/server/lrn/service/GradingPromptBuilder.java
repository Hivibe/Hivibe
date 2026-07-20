package com.hivibe.server.lrn.service;

import org.springframework.stereotype.Component;

/**
 * AI 채점 프롬프트 생성기
 * - 의미 동등성 판단 + 차이점/추천/보안 피드백 요청
 */
@Component
public class GradingPromptBuilder {

    private static final int MAX_CONTEXT_LEN = 3000;

    public String build(String lang, String expectedAnswer, String userAnswer, String templateContext) {
        return """
            당신은 코드 채점 AI입니다. 사용자가 빈칸에 입력한 코드가 정답 코드와 "의미적으로 동등한지" 판단하고,
            정답이든 오답이든 학습에 도움이 되는 피드백을 제공하세요.

            [언어]
            %s

            [빈칸이 포함된 전체 코드 컨텍스트]

            %s

            [모범답안]

            %s

            [사용자 입력 답안]

            %s

            === 판단 기준 ===

            equivalent=true 조건:
            - 변수명/공백/줄바꿈/주석 차이는 허용
            - 동등한 자료구조·메서드 호출 (예: new HashMap<>() vs new HashMap<Integer, Integer>())
            - 동등한 표현식 (예: i++ vs i+=1)
            - 빈칸 컨텍스트에서 동작이 같으면 OK

            equivalent=false 조건:
            - 자료구조나 알고리즘이 다름
            - 시간복잡도가 달라짐
            - 컴파일 에러가 날 코드
            - 빠뜨린 핵심 로직이 있음

            === 피드백 작성 규칙 ===

            diffNote (필수):
            - equivalent=true인 경우: 정답 코드와 사용자 코드의 차이점을 1~2문장으로. 완전히 동일한 의미면 "정답 코드와 동일한 방식입니다."
            - equivalent=false인 경우: 왜 틀렸는지, 무엇이 다른지 1~2문장으로

            recommend (선택, 없으면 null):
            - 사용자 코드가 정답이어도 더 나은 작성법이 있으면 1~2문장 추천
            - 오답이지만 결과가 우연히 맞는 경우, 왜 그 방식이 문제인지 설명
            - 관용적 표현(idiomatic), 가독성, 성능 관점에서
            - 특별히 추천할 게 없으면 null

            securityNote (선택, 없으면 null):
            - NullPointerException 가능성, 인덱스 범위 초과, 리소스 누수, 정수 오버플로우 등
            - 사용자 코드에 잠재적 문제가 있으면 1문장으로 경고
            - 문제 없으면 null

            모든 피드백은 한국어로, 주니어 개발자가 이해할 수 있는 톤으로 작성하세요.

            === 출력 ===

            반드시 아래 JSON만 출력 (마크다운/설명 금지):

            {
              "equivalent": true,
              "diffNote": "정답 코드와의 차이점 1~2문장",
              "recommend": "더 나은 작성법 추천 또는 null",
              "securityNote": "보안/안정성 경고 또는 null"
            }
            """.formatted(lang, truncate(templateContext), expectedAnswer, userAnswer);
    }

    private String truncate(String s) {
        if (s == null) return "";
        return s.length() <= MAX_CONTEXT_LEN ? s : s.substring(0, MAX_CONTEXT_LEN) + "\n... (생략)";
    }
}