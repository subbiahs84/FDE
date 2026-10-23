package com.meridian.reliability.controller;

import com.meridian.reliability.dto.*;
import com.meridian.reliability.service.JobAttemptService;
import com.meridian.reliability.service.ReportAnalysisService;
import com.meridian.reliability.service.RetryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {
    private final JobAttemptService jobAttempts;
    private final ReportAnalysisService analysis;
    private final RetryService retries;

    @GetMapping
    public List<JobAttemptResponse> all() { return jobAttempts.all(); }

    @PostMapping("/attempts")
    @ResponseStatus(HttpStatus.CREATED)
    public JobAttemptResponse create(@Valid @RequestBody JobAttemptRequest request) { return jobAttempts.create(request); }

    @GetMapping("/failed")
    public List<UndeliveredReportResponse> failed() { return analysis.undelivered(); }

    @GetMapping("/unknown-statuses")
    public List<UnknownStatusResponse> unknownStatuses() { return analysis.unknownStatuses(); }

    @PostMapping("/retry/{jobId}")
    public RetryResponse retry(@PathVariable Long jobId) { return retries.requestRetry(jobId); }
}
