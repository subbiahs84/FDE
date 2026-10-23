package com.meridian.reliability.dto;

import com.meridian.reliability.domain.Classification;
import java.time.Instant;
import java.time.LocalDateTime;

public record JobAttemptResponse(Long id, String tenantId, String reportName, LocalDateTime scheduleTime,
                                 Integer attemptNumber, String status, String errorCode, Instant executionTime,
                                 Classification classification) { }
