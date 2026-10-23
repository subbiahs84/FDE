package com.meridian.reliability.dto;

public record OperationalMetricsResponse(long totalJobs, long successfulJobs, long failedJobs,
                                         long retryableFailures, long unknownStatuses,
                                         double retrySuccessRate, long undeliveredReports) { }
