package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.Dgns;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DgnsRepository extends JpaRepository<Dgns, Long> {

    // 유저별 총 진단 횟수
    long countByUser_Id(Long userId);

    // 유저별 진단 목록 (날짜순, 스트릭 계산용)
    List<Dgns> findByUser_IdOrderByDgnsDtAsc(Long userId);

    // 유저별 진단 목록 (최신순, "이전 분석에서 불러오기"용)
    List<Dgns> findByUser_IdOrderByDgnsDtDesc(Long userId);

    // 본인 소유 진단 단건 조회 (다른 유저 데이터 접근 방지)
    java.util.Optional<Dgns> findByDgnsIdAndUser_Id(Long dgnsId, Long userId);

    // 유저별 사용 언어 DISTINCT (Polyglot 뱃지용)
    @Query("SELECT DISTINCT d.anls.ornCd.lang FROM Dgns d WHERE d.user.id = :userId")
    List<String> findDistinctLangByUserId(Long userId);

    // 유저별 최고 점수 (Speed Optimizer, Perfectionist 뱃지용)
    @Query("SELECT MAX(d.anls.cdScr) FROM Dgns d WHERE d.user.id = :userId")
    Integer findMaxScoreByUserId(Long userId);

    // 유저별 평균 점수 (마이페이지 평균 등급용)
    @Query("SELECT AVG(d.anls.cdScr) FROM Dgns d WHERE d.user.id = :userId")
    Double findAvgScoreByUserId(Long userId);

    // S등급 달성 여부 (Grade S 뱃지용)
    @Query("SELECT COUNT(d) > 0 FROM Dgns d WHERE d.user.id = :userId AND d.anls.cdGrd = :grade")
    boolean existsByUserIdAndGrade(Long userId, String grade);
}