package com.meridian.reliability.repository;

import com.meridian.reliability.entity.JobAttempt;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobAttemptRepository extends JpaRepository<JobAttempt, Long> {
    @Query("select j from JobAttempt j order by j.tenantId, j.reportName, j.scheduleTime, j.attemptNumber")
    List<JobAttempt> findAllForAnalysis();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select j from JobAttempt j where j.id = :id")
    Optional<JobAttempt> findByIdForUpdate(@Param("id") Long id);
}
