package com.hivibe.server.lrn.service;

import org.springframework.stereotype.Component;

@Component
public class GradingPromptBuilder {

    public String build(String lang, String expectedAnswer, String userAnswer, String templateContext) {
        return """
            당신은 코드 채점 AI입니다. 사용자가 빈칸에 입력한 코드가 정답 코드와 "의미적으로 동등한지" 판단하세요.
            
            [언어]
            %s
            
            [빈칸이 포함된 전체 코드 컨텍스트]

            %s
            
            [정답 코드]

            %s
            
            [사용자 입력 코드]

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
            
            === 출력 ===
            
            반드시 아래 JSON만 출력 (마크다운/설명 금지):
            
            {
              "equivalent": true,
              "reason": "이유 1~2문장 (한국어)"
            }
            """.formatted(lang, templateContext, expectedAnswer, userAnswer);
    }
}