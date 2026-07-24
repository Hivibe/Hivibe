package com.hivibe.server.repository;

import com.hivibe.server.domain.entity.RvwSched;
import com.hivibe.server.domain.enums.RvwStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RvwSchedRepository extends JpaRepository<RvwSched, Long> {

    /** 스케줄러: 오늘까지 도래한 PENDING 건 (알림 동의자만) */
    @Query("""
            select rs from RvwSched rs
            join fetch rs.user u
            join fetch rs.lrn l
            where rs.status = com.hivibe.server.domain.enums.RvwStatus.PENDING
              and rs.dueDate <= :today
              and u.reviewAlarmYn = 'Y'
            order by rs.dueDate asc, rs.rvwSchedId asc
            """)
    List<RvwSched> findDueSchedules(@Param("today") LocalDate today);

    /** 내 복습 목록 (PENDING + SENT) */
    @Query("""
            select rs from RvwSched rs
            join fetch rs.lrn l
            where rs.user.id = :userId
              and rs.status in :statuses
            order by rs.dueDate asc, rs.stage asc
            """)
    List<RvwSched> findMyReviews(@Param("userId") Long userId,
                                 @Param("statuses") List<RvwStatus> statuses);

    List<RvwSched> findByLrn_LrnIdOrderByStageAsc(Long lrnId);

    boolean existsByLrn_LrnId(Long lrnId);

    Optional<RvwSched> findFirstByLrn_LrnIdAndStatusOrderByStageAsc(Long lrnId, RvwStatus status);

    long countByUser_IdAndStatusIn(Long userId, List<RvwStatus> statuses);

    /** 캐시 동기화용: 가장 가까운 미완료 건 */
    Optional<RvwSched> findFirstByLrn_LrnIdAndStatusInOrderByDueDateAscStageAsc(
            Long lrnId, List<RvwStatus> statuses);

    long countByLrn_LrnIdAndStatus(Long lrnId, RvwStatus status);

    void deleteByLrn_LrnId(Long lrnId);

    /** 스케줄러: 오늘까지 도래한 PENDING 건 중, 지금 시각을 희망한 사용자 */
    @Query("""
            select rs from RvwSched rs
            join fetch rs.user u
            join fetch rs.lrn l
            where rs.status = com.hivibe.server.domain.enums.RvwStatus.PENDING
              and rs.dueDate <= :today
              and u.reviewAlarmYn = 'Y'
              and u.reviewAlarmHour = :hour
            order by rs.dueDate asc, rs.rvwSchedId asc
            """)
    List<RvwSched> findDueSchedules(@Param("today") LocalDate today,
                                    @Param("hour") int hour);
}