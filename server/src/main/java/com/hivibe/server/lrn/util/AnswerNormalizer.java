package com.hivibe.server.lrn.util;

import org.springframework.stereotype.Component;

@Component
public class AnswerNormalizer {

    /**
     * 답안 비교용 정규화
     * - 줄 끝 공백 제거
     * - 연속 공백 1개로
     * - 줄바꿈 통일 (\r\n, \r → \n)
     * - 양끝 공백 제거
     * - 세미콜론 뒤 공백 정리
     */
    public String normalize(String input) {
        if (input == null) return "";
        return input
            .replace("\r\n", "\n")
            .replace("\r", "\n")
            .replaceAll("[ \\t]+\\n", "\n")    // 줄끝 공백
            .replaceAll("[ \\t]+", " ")        // 연속 공백
            .replaceAll("\\n{2,}", "\n")       // 빈 줄 정리
            .trim();
    }

    public boolean matches(String userAns, String expectedAns) {
        return normalize(userAns).equals(normalize(expectedAns));
    }
}