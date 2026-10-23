package com.meridian.reliability.dto;

import com.meridian.reliability.domain.Classification;
import java.time.LocalDateTime;
import java.util.List;

public record UndeliveredReportResponse(String tenantId, String reportName, LocalDateTime scheduleTime,
                                        int attempts, Classification finalClassification, Long latestAttemptId,
                                        String latestStatus, List<Long> attemptIds) { }
