package com.hivibe.server.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
 
/**
 * 공통 API 응답 포맷
 * 모든 API 응답을 이 형태로 통일
 *
 * 성공 예시:
 * {
 *   "success": true,
 *   "message": "회원가입이 완료되었습니다.",
 *   "data": { ... }
 * }
 *
 * 실패 예시:
 * {
 *   "success": false,
 *   "message": "이미 사용 중인 아이디입니다.",
 *   "data": null
 * }
 */
@Getter
@Builder
@AllArgsConstructor
public class ApiresponseDTO<T> {

    /** 성공 여부 */
    private boolean success;
 
    /** 응답 메시지 */
    private String message;
 
    /** 응답 데이터 (실패 시 null) */
    private T data;


    /** 성공 응답 생성 메서드 (데이터 있음)*/
    public static <T> ApiresponseDTO<T> success(String message, T data){
        return ApiresponseDTO.<T>builder()
        .success(true)
        .message(message)
        .data(data)
        .build();
    }


    /** 성공 응답 생성 메서드 (데이터 없음)*/
    public static <T> ApiresponseDTO<T> success(String message) {
        return ApiresponseDTO.<T>builder()
                .success(true)
                .message(message)
                .data(null)
                .build();
    }

    /** 실패 응답 */
     public static <T> ApiresponseDTO<T> fail(String message) {
        return ApiresponseDTO.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .build();
    }

    
}
