package com.hivibe.server.lrn.service;

import org.springframework.stereotype.Component;

@Component
public class BlankPromptBuilder {

    public String build(String lang, String originalCode, String optimizedCode,
                        String origTimeComp, String optTimeComp, String difficulty) {

        String difficultyGuide = switch (difficulty) {
            case "E" -> """
                [난이도: Easy]
                - 빈칸 1~2개. 핵심 자료구조 선언 부분만 뚫기 (예: HashMap 선언).
                - 사용자가 5분 이내에 풀 수 있을 정도로 쉽게.
                """;
            case "H" -> """
                [난이도: Hard]
                - 빈칸 4~5개. 자료구조 선언 + 핵심 로직 전체를 뚫기.
                - 알고리즘의 전체 흐름을 직접 작성해야 풀리도록.
                """;
            default -> """
                [난이도: Medium]
                - 빈칸 2~3개. 자료구조 선언 + 핵심 로직 일부를 뚫기.
                - 절반은 주어지고 절반은 직접 작성하는 수준.
                """;
        };

        return """
            당신은 주니어 개발자를 위한 코드 학습 콘텐츠를 만드는 AI입니다.
            원본 코드와 최적화된 정답 코드를 바탕으로, 사용자가 직접 채워보며 학습할 빈칸 챌린지를 만드세요.
            
            [언어]
            %s
            
            [원본 코드 시간복잡도]
            %s
            
            [최적화 코드 시간복잡도]
            %s
            
            [원본 코드]
            %s
            [최적화 코드 (정답)]
            %s

            %s
            
            === 규칙 ===
            
            1. templateCode: 최적화 코드에서 빈칸으로 뚫을 부분을 정확히 `{{BLANK_1}}`, `{{BLANK_2}}` 같은 마커로 치환한 전체 코드.
               - 마커 외 다른 부분은 최적화 코드와 100%% 동일해야 함.
               - 들여쓰기, 줄바꿈 유지.
            
            2. blanks: 각 빈칸별 정답과 단계별 힌트.
               - blankKey: "BLANK_1", "BLANK_2", ... (templateCode의 마커와 정확히 일치)
               - blankOrd: 1부터 시작하는 정수
               - expectedAnswer: 해당 빈칸에 들어갈 정답 코드 조각 (앞뒤 공백 제거)
               - hintLv1: 개념 수준의 넓은 힌트 (예: "어떤 자료구조면 O(1) 조회가 가능할까요?")
               - hintLv2: 구체적 힌트 (예: "Java의 Map 인터페이스를 활용합니다")
               - hintLv3: 거의 정답에 가까운 힌트 (예: "Map<Integer, Integer> map = new HashMap<>();")
               - relatedConceptTitle: 이 빈칸이 학습시키는 개념의 제목 (아래 concepts 배열의 concTitle 중 하나와 일치, 최적화 측 P 개념과 매칭)
            
            3. concepts: 학습 화면에 표시할 개념 카드. cdType으로 원본/최적화 구분.
               - cdType "O": 원본 코드에서 사용된 개념 (예: "이중 반복문", "선형 탐색")
               - cdType "P": 최적화 코드에서 도입된 개념 (예: "HashMap", "해시 충돌")
               - 원본 측 1~2개, 최적화 측 2~3개 권장.
               - concTitle: 짧고 명확하게 (50자 이내)
               - concDesc: 2~3 문장 설명
               - refUrl: 공식 문서나 신뢰할 만한 학습 자료 URL (없으면 빈 문자열)
               - sortOrd: 표시 순서 (원본 측은 1부터, 최적화 측은 별도로 1부터)
            
            === 출력 ===
            
            반드시 아래 JSON 스키마만 출력하세요. 마크다운, 주석, 설명 절대 포함 금지.
            
            {
              "templateCode": "string",
              "blanks": [
                {
                  "blankKey": "BLANK_1",
                  "blankOrd": 1,
                  "expectedAnswer": "string",
                  "hintLv1": "string",
                  "hintLv2": "string",
                  "hintLv3": "string",
                  "relatedConceptTitle": "string"
                }
              ],
              "concepts": [
                {
                  "cdType": "O",
                  "concTitle": "string",
                  "concDesc": "string",
                  "refUrl": "string",
                  "sortOrd": 1
                }
              ]
            }
            """.formatted(lang, origTimeComp, optTimeComp, originalCode, optimizedCode, difficultyGuide);
    }
}