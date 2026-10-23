package com.meridian.reliability.service;

import com.meridian.reliability.classifier.ClassificationService;
import com.meridian.reliability.dto.JobAttemptRequest;
import com.meridian.reliability.dto.JobAttemptResponse;
import com.meridian.reliability.entity.JobAttempt;
import com.meridian.reliability.repository.JobAttemptRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobAttemptService {
    private final JobAttemptRepository attempts;
    private final ClassificationService classifier;

    @Transactional
    public JobAttemptResponse create(JobAttemptRequest request) {
        var attempt = new JobAttempt();
        attempt.setTenantId(request.tenantId().trim());
        attempt.setReportName(request.reportName().trim());
        attempt.setScheduleTime(request.scheduleTime());
        attempt.setAttemptNumber(request.attemptNumber());
        attempt.setStatus(request.status().trim());
        attempt.setErrorCode(request.errorCode());
        attempt.setExecutionTime(request.executionTime());
        return response(attempts.save(attempt));
    }

    @Transactional
    public List<JobAttemptResponse> all() {
        return attempts.findAllForAnalysis().stream().map(this::response).toList();
    }

    private JobAttemptResponse response(JobAttempt j) {
        return new JobAttemptResponse(j.getId(), j.getTenantId(), j.getReportName(), j.getScheduleTime(),
                j.getAttemptNumber(), j.getStatus(), j.getErrorCode(), j.getExecutionTime(),
                classifier.classify(j.getStatus()));
    }
}
