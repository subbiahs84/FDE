package com.meridian.reliability.controller;

import com.meridian.reliability.dto.OperationalMetricsResponse;
import com.meridian.reliability.service.ReportAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class MetricsController {
    private final ReportAnalysisService analysis;
    @GetMapping
    public OperationalMetricsResponse metrics() { return analysis.metrics(); }
}
