package com.meridian.reliability.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_attempt", indexes = {
        @Index(name = "idx_job_group", columnList = "tenant_id,report_name,schedule_time"),
        @Index(name = "idx_job_status", columnList = "status")
}, uniqueConstraints = @UniqueConstraint(name = "uk_job_attempt_number",
        columnNames = {"tenant_id", "report_name", "schedule_time", "attempt_number"}))
@Getter @Setter @NoArgsConstructor
public class JobAttempt {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "tenant_id", nullable = false, length = 100)
    private String tenantId;
    @Column(name = "report_name", nullable = false, length = 150)
    private String reportName;
    @Column(name = "schedule_time", nullable = false)
    private LocalDateTime scheduleTime;
    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;
    @Column(nullable = false, length = 80)
    private String status;
    @Column(name = "error_code", length = 120)
    private String errorCode;
    @Column(name = "execution_time")
    private Instant executionTime;

    @Version
    private Long version;
}
