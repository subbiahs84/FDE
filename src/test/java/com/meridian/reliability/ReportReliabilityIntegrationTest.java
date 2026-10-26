package com.meridian.reliability;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meridian.reliability.domain.Classification;
import com.meridian.reliability.domain.RetryStatus;
import com.meridian.reliability.entity.ClassificationRule;
import com.meridian.reliability.entity.RetryHistory;
import com.meridian.reliability.repository.ClassificationRuleRepository;
import com.meridian.reliability.repository.JobAttemptRepository;
import com.meridian.reliability.repository.RetryHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReportReliabilityIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JobAttemptRepository attempts;
    @Autowired ClassificationRuleRepository rules;
    @Autowired RetryHistoryRepository retryHistory;

    @BeforeEach
    void reset() {
        retryHistory.deleteAll();
        attempts.deleteAll();
        rules.deleteAll();
        rules.saveAll(java.util.List.of(
                new ClassificationRule("SUCCESS", Classification.SUCCESS),
                new ClassificationRule("COMPLETED", Classification.SUCCESS),
                new ClassificationRule("FAILED", Classification.RETRYABLE_FAILURE),
                new ClassificationRule("TIMEOUT", Classification.RETRYABLE_FAILURE),
                new ClassificationRule("INVALID_CONFIGURATION", Classification.NON_RETRYABLE_FAILURE)));
    }

    @Test
    void reportsAreGroupedAsUndeliveredOnlyWhenNoAttemptSucceeded() throws Exception {
        var schedule = LocalDateTime.of(2026, 1, 1, 0, 0);
        insert("TenantA", "Monthly", schedule, 1, "FAILED");
        insert("TenantA", "Monthly", schedule, 2, "TIMEOUT");
        insert("TenantB", "Daily", schedule, 1, "FAILED");
        insert("TenantB", "Daily", schedule, 2, "COMPLETED");

        mvc.perform(get("/api/jobs/failed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].tenantId").value("TenantA"))
                .andExpect(jsonPath("$[0].attempts").value(2))
                .andExpect(jsonPath("$[0].finalClassification").value("RETRYABLE_FAILURE"));
    }

    @Test
    void unknownStatusesAreReportedAndNeverAssumedRetryable() throws Exception {
        insert("TenantU", "Report", LocalDateTime.of(2026, 1, 2, 0, 0), 1, "ODD_STATE");
        mvc.perform(get("/api/jobs/unknown-statuses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("ODD_STATE"))
                .andExpect(jsonPath("$[0].occurrences").value(1));
    }

    @Test
    void retryIsBoundedAndOnlyPermittedForRetryableClassifications() throws Exception {
        var job = insert("TenantR", "Report", LocalDateTime.of(2026, 1, 3, 0, 0), 1, "FAILED");
        for (int n = 0; n < 3; n++) {
            mvc.perform(post("/api/jobs/retry/{id}", job.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("ACCEPTED"));
        }
        mvc.perform(post("/api/jobs/retry/{id}", job.getId())).andExpect(status().isConflict());
        assertThat(retryHistory.countByJobAttemptId(job.getId())).isEqualTo(3);

        var permanent = insert("TenantR", "Other", LocalDateTime.of(2026, 1, 3, 0, 0), 1, "INVALID_CONFIGURATION");
        mvc.perform(post("/api/jobs/retry/{id}", permanent.getId())).andExpect(status().isConflict());
    }

    @Test
    void validatesAttemptIngestionAndMetrics() throws Exception {
        mvc.perform(post("/api/jobs/attempts").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"tenantId":"TenantX","reportName":"Report","scheduleTime":"2026-02-01T00:00:00",
                                 "attemptNumber":0,"status":"FAILED"}
                                """))
                .andExpect(status().isBadRequest());
        insert("TenantM", "Report", LocalDateTime.of(2026, 1, 4, 0, 0), 1, "ODD");
        mvc.perform(get("/api/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalJobs").value(1))
                .andExpect(jsonPath("$.unknownStatuses").value(1))
                .andExpect(jsonPath("$.retrySuccessRate").value(0.0));
    }

    @Test
    void exposesDatabaseComponentInActuatorHealth() throws Exception {
        mvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.db.status").value("UP"));
    }

    @Test
    void retrySuccessRateUsesOnlyCompletedRetryOutcomes() throws Exception {
        var job = insert("TenantRate", "Report", LocalDateTime.of(2026, 1, 5, 0, 0), 1, "FAILED");
        saveRetry(job, RetryStatus.SUCCEEDED, 1);
        saveRetry(job, RetryStatus.FAILED, 2);
        saveRetry(job, RetryStatus.REJECTED, 3);
        saveRetry(job, RetryStatus.ACCEPTED, 4);

        mvc.perform(get("/api/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.retrySuccessRate").value(0.5));
    }

    private com.meridian.reliability.entity.JobAttempt insert(String tenant, String report, LocalDateTime schedule,
                                                               int attemptNo, String status) {
        var job = new com.meridian.reliability.entity.JobAttempt();
        job.setTenantId(tenant);
        job.setReportName(report);
        job.setScheduleTime(schedule);
        job.setAttemptNumber(attemptNo);
        job.setStatus(status);
        return attempts.save(job);
    }

    private void saveRetry(com.meridian.reliability.entity.JobAttempt job, RetryStatus status, int retryCount) {
        var retry = new RetryHistory();
        retry.setJobAttempt(job);
        retry.setRetryCount(retryCount);
        retry.setRetryStatus(status);
        retry.setRetryTimestamp(java.time.Instant.now());
        retryHistory.save(retry);
    }
}
