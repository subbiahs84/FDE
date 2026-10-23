package com.meridian.reliability.entity;

import com.meridian.reliability.domain.RetryStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "retry_history", indexes = @Index(name = "idx_retry_job", columnList = "job_attempt_id"))
@Getter @Setter @NoArgsConstructor
public class RetryHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_attempt_id", nullable = false)
    private JobAttempt jobAttempt;
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount;
    @Enumerated(EnumType.STRING)
    @Column(name = "retry_status", nullable = false, length = 30)
    private RetryStatus retryStatus;
    @Column(name = "retry_timestamp", nullable = false)
    private Instant retryTimestamp;
    @Column(length = 500)
    private String detail;
}
