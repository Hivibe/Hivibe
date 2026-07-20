package com.hivibe.server.lrn.util;

import org.springframework.stereotype.Component;

/**
 * 답안 정규화 후 문자열 비교
 * - 공백/세미콜론/따옴표 차이는 정답으로 인정
 */
@Component
public class AnswerNormalizer {

    /** 정규화된 문자열이 완전히 같은지 */
    public boolean matches(String userAns, String expAns) {
        if (userAns == null || expAns == null) return false;
        return normalize(userAns).equals(normalize(expAns));
    }

    /**
     * 정규화 규칙
     * 1. 앞뒤 공백 제거
     * 2. 연속 공백 → 단일 공백
     * 3. 끝 세미콜론 제거
     * 4. 작은따옴표 → 큰따옴표 통일
     * 5. 괄호/연산자 주변 공백 제거
     */
    public String normalize(String s) {
        if (s == null) return "";
        String r = s.trim();
        r = r.replaceAll("\\s+", " ");
        r = r.replaceAll(";+$", "");
        r = r.replace('\'', '"');
        r = r.replaceAll("\\s*([(){}\\[\\],.;])\\s*", "$1");
        r = r.replaceAll("\\s*(<|>|<=|>=|==|!=|\\+|-|\\*|/|=)\\s*", "$1");
        return r.trim();
    }
}