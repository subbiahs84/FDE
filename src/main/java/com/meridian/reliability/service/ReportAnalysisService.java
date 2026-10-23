package com.meridian.reliability.service;

import com.meridian.reliability.classifier.ClassificationService;
import com.meridian.reliability.domain.Classification;
import com.meridian.reliability.dto.OperationalMetricsResponse;
import com.meridian.reliability.dto.UndeliveredReportResponse;
import com.meridian.reliability.dto.UnknownStatusResponse;
import com.meridian.reliability.entity.JobAttempt;
import com.meridian.reliability.repository.JobAttemptRepository;
import com.meridian.reliability.repository.RetryHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportAnalysisService {
    private final JobAttemptRepository attempts;
    private final RetryHistoryRepository retryHistory;
    private final ClassificationService classifier;

    @Transactional(readOnly = true)
    public List<UndeliveredReportResponse> undelivered() {
        return grouped().values().stream()
                .filter(group -> group.stream().noneMatch(j -> classifier.classify(j.getStatus()) == Classification.SUCCESS))
                .map(group -> {
                    var latest = group.get(group.size() - 1);
                    var classification = classifier.classify(latest.getStatus());
                    if (classification == Classification.SUCCESS) classification = Classification.NON_RETRYABLE_FAILURE;
                    return new UndeliveredReportResponse(latest.getTenantId(), latest.getReportName(),
                            latest.getScheduleTime(), group.size(), classification, latest.getId(),
                            latest.getStatus(), group.stream().map(JobAttempt::getId).toList());
                }).toList();
    }

    @Transactional(readOnly = true)
    public List<UnknownStatusResponse> unknownStatuses() {
        return attempts.findAllForAnalysis().stream()
                .filter(j -> classifier.classify(j.getStatus()) == Classification.UNKNOWN)
                .collect(Collectors.groupingBy(j -> j.getStatus().trim().toUpperCase(Locale.ROOT),
                        TreeMap::new, Collectors.toList()))
                .entrySet().stream()
                .map(entry -> new UnknownStatusResponse(entry.getKey(), entry.getValue().size(),
                        entry.getValue().stream().map(JobAttempt::getId).toList()))
                .toList();
    }

    @Transactional(readOnly = true)
    public OperationalMetricsResponse metrics() {
        var all = attempts.findAllForAnalysis();
        long success = all.stream().filter(j -> classifier.classify(j.getStatus()) == Classification.SUCCESS).count();
        long retryable = all.stream().filter(j -> classifier.classify(j.getStatus()) == Classification.RETRYABLE_FAILURE).count();
        long unknown = all.stream().filter(j -> classifier.classify(j.getStatus()) == Classification.UNKNOWN).count();
        long failed = all.size() - success;
        long completedRetries = retryHistory.countCompletedRetries();
        long successfulRetries = retryHistory.countSucceededRetries();
        double successRate = completedRetries == 0 ? 0.0 : (double) successfulRetries / completedRetries;
        return new OperationalMetricsResponse(all.size(), success, failed, retryable, unknown,
                successRate, undelivered().size());
    }

    private Map<GroupKey, List<JobAttempt>> grouped() {
        Map<GroupKey, List<JobAttempt>> groups = new LinkedHashMap<>();
        attempts.findAllForAnalysis().forEach(j -> groups.computeIfAbsent(
                new GroupKey(j.getTenantId(), j.getReportName(), j.getScheduleTime().toLocalDate()),
                ignored -> new ArrayList<>()).add(j));
        groups.values().forEach(group -> group.sort(Comparator.comparing(JobAttempt::getAttemptNumber)
                .thenComparing(JobAttempt::getId)));
        return groups;
    }

    private record GroupKey(String tenantId, String reportName, java.time.LocalDate scheduleDate) { }
}
