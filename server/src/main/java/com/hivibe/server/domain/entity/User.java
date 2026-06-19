package com.hivibe.server.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor; //기본 생성자를 자동으로 만들어주는 Lombok 어노테이션
import lombok.Setter;
import java.time.LocalDateTime;

@Entity 
@Table(name = "USER")
@Getter 
@Setter 
@NoArgsConstructor
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_ID")
    private Long id;

    //로그인 아이디
    @Column(name = "LGN_ID", nullable = false, unique = true, length = 100)
    private String lgnId;

    //로그인 비밀번호
    @Column(name = "LGN_PWSD", nullable = false, length = 100)
    private String lgnPwsd;

    //계정 활성화 여부
    public static final String STATUS_ACTIVE   = "A";
    public static final String STATUS_INACTIVE = "I";
    public static final String STATUS_LOCKED   = "L";

    @Column(name = "ACNT_STTS_CD", nullable = false, length = 1)
    private String acntSttsCd;

    //비밀번호 변경 여부
    @Column(name = "PSWD_CHG_YN", nullable = false, length = 1)
    private String pswdChgYn;

    //로그인 실패 횟수
    @Column(name = "LGN_FAIL_NMTM")
    private Integer lgnFailNmtm;

    //계정 잠금 여부
    @Column(name = "ACNT_JOIN_DT", nullable = false)
    private LocalDateTime acntJoinDt = LocalDateTime.now();

    //마케팅 수신 동의 여부
    @Column(name = "MKTG_AGREE_YN", nullable = false, length = 1)
    private String mktgAgreeYn;

    //탈퇴 여부
    @Column(name = "USER_NM", length = 100)
    private String userNm;

    //사용자 생년월일
    @Column(name = "USER_BRKT", length = 8)
    private String userBrkt;

    //사용자 이메일
    @Column(name = "USER_EMAIL", length = 320)
    private String userEmail;

    //사용자 프로필 사진 URL
    @Column(name = "USER_PHOTO", length = 500)
    private String userPhoto;

    //사용자 등급
    @Column(name = "USER_GRD", length = 20)
    private String userGrd;

    //사용자 전화번호
    @Column(name = "USER_PHONE", length = 11)
    private String userPhone;

    // 복습 알림 동의
    @Column(name = "REVIEW_ALARM_YN", nullable = false, length = 1)
    private String reviewAlarmYn = "Y";

    @PrePersist
    protected void onCreate() {
        if (acntJoinDt == null) acntJoinDt = LocalDateTime.now();
    }
}