package com.meridian.reliability.repository;

import com.meridian.reliability.entity.RetryHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RetryHistoryRepository extends JpaRepository<RetryHistory, Long> {
    long countByJobAttemptId(Long jobAttemptId);
    @Query("select count(r) from RetryHistory r where r.retryStatus = com.meridian.reliability.domain.RetryStatus.SUCCEEDED")
    long countSucceededRetries();
    @Query("select count(r) from RetryHistory r where r.retryStatus in (com.meridian.reliability.domain.RetryStatus.SUCCEEDED, com.meridian.reliability.domain.RetryStatus.REJECTED)")
    long countCompletedRetries();
}
