package com.meridian.reliability.service;

import com.meridian.reliability.classifier.ClassificationService;
import com.meridian.reliability.domain.Classification;
import com.meridian.reliability.domain.RetryStatus;
import com.meridian.reliability.dto.RetryResponse;
import com.meridian.reliability.entity.AuditEvent;
import com.meridian.reliability.entity.RetryHistory;
import com.meridian.reliability.exception.ResourceNotFoundException;
import com.meridian.reliability.exception.RetryNotAllowedException;
import com.meridian.reliability.repository.AuditEventRepository;
import com.meridian.reliability.repository.JobAttemptRepository;
import com.meridian.reliability.repository.RetryHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.TransientDataAccessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RetryService {
    private static final Logger log = LoggerFactory.getLogger(RetryService.class);
    private final JobAttemptRepository attempts;
    private final RetryHistoryRepository history;
    private final AuditEventRepository auditEvents;
    private final ClassificationService classifier;
    @Value("${meridian.retry.max-retries:3}")
    private int maxRetries;

    @Transactional
    @Retryable(retryFor = TransientDataAccessException.class,
            maxAttemptsExpression = "${meridian.retry.persistence-attempts:3}",
            backoff = @Backoff(delayExpression = "${meridian.retry.persistence-backoff-ms:100}"))
    public RetryResponse requestRetry(Long jobId) {
        var job = attempts.findByIdForUpdate(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job attempt " + jobId + " was not found."));
        var classification = classifier.classify(job.getStatus());
        if (classification != Classification.RETRYABLE_FAILURE) {
            throw new RetryNotAllowedException("Only retryable failures can be retried; current classification is " + classification + ".");
        }
        int retryCount = Math.toIntExact(history.countByJobAttemptId(jobId));
        if (retryCount >= maxRetries) throw new RetryNotAllowedException("Maximum retry count of " + maxRetries + " has been reached.");
        var now = Instant.now();
        var retry = new RetryHistory();
        retry.setJobAttempt(job);
        retry.setRetryCount(retryCount + 1);
        retry.setRetryStatus(RetryStatus.ACCEPTED);
        retry.setRetryTimestamp(now);
        retry.setDetail("Accepted for dispatch to the report-runner integration boundary.");
        history.save(retry);
        auditEvents.save(new AuditEvent("RETRY_REQUESTED",
                "Retry " + (retryCount + 1) + " accepted for job attempt " + jobId + "."));
        log.info("Retry request accepted: jobAttemptId={}, retryCount={}", jobId, retryCount + 1);
        return new RetryResponse(jobId, retryCount + 1, maxRetries, RetryStatus.ACCEPTED, now);
    }
}
