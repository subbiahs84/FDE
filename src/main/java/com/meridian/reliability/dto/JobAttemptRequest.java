package com.meridian.reliability.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDateTime;

public record JobAttemptRequest(
        @NotBlank @Size(max = 100) String tenantId,
        @NotBlank @Size(max = 150) String reportName,
        @NotNull LocalDateTime scheduleTime,
        @NotNull @Positive Integer attemptNumber,
        @NotBlank @Size(max = 80) String status,
        @Size(max = 120) String errorCode,
        Instant executionTime) { }
