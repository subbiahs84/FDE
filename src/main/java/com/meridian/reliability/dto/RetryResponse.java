package com.meridian.reliability.dto;

import com.meridian.reliability.domain.RetryStatus;
import java.time.Instant;

public record RetryResponse(Long jobAttemptId, int retryCount, int maxRetries, RetryStatus status, Instant requestedAt) { }
