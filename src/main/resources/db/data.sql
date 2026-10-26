INSERT IGNORE INTO classification_rule (status, classification) VALUES
('SUCCESS', 'SUCCESS'),
('COMPLETED', 'SUCCESS'),
('DELIVERED', 'SUCCESS'),
('FAILED', 'RETRYABLE_FAILURE'),
('ERROR', 'RETRYABLE_FAILURE'),
('TIMEOUT', 'RETRYABLE_FAILURE'),
('NETWORK_ERROR', 'RETRYABLE_FAILURE'),
('SERVICE_UNAVAILABLE', 'RETRYABLE_FAILURE'),
('RETRY_EXHAUSTED', 'NON_RETRYABLE_FAILURE'),
('INVALID_CONFIGURATION', 'NON_RETRYABLE_FAILURE'),
('TEMPLATE_MISSING', 'NON_RETRYABLE_FAILURE'),
('PERMISSION_DENIED', 'NON_RETRYABLE_FAILURE'),
('WARNING', 'NON_RETRYABLE_FAILURE'),
('COMPLETED_WITH_WARNING', 'NON_RETRYABLE_FAILURE');

INSERT IGNORE INTO job_attempt
(tenant_id, report_name, schedule_time, attempt_number, status, error_code, execution_time) VALUES
('TenantA', 'MonthlyReport', '2026-01-01 00:00:00', 1, 'FAILED', 'UPSTREAM_TIMEOUT', '2026-01-01 00:02:00'),
('TenantA', 'MonthlyReport', '2026-01-01 00:00:00', 2, 'FAILED', 'UPSTREAM_TIMEOUT', '2026-01-01 00:04:00'),
('TenantB', 'DailyReport', '2026-01-02 00:00:00', 1, 'FAILED', 'TRANSIENT', '2026-01-02 00:01:00'),
('TenantB', 'DailyReport', '2026-01-02 00:00:00', 2, 'SUCCESS', NULL, '2026-01-02 00:03:00'),
('TenantC', 'WeeklyReport', '2026-01-04 00:00:00', 1, 'TIMEOUT', 'GATEWAY_TIMEOUT', '2026-01-04 00:05:00'),
('TenantD', 'QuarterlyReport', '2026-01-05 00:00:00', 1, 'PROVIDER_PENDING', NULL, '2026-01-05 00:01:00');

INSERT IGNORE INTO retry_history
(job_attempt_id, retry_count, retry_status, retry_timestamp, detail)
SELECT id, 1, 'SUCCEEDED', '2026-01-02 00:03:00',
       'Sample retry completed successfully.'
FROM job_attempt
WHERE tenant_id = 'TenantB'
  AND report_name = 'DailyReport'
  AND schedule_time = '2026-01-02 00:00:00'
  AND attempt_number = 1
  AND status = 'FAILED';

INSERT IGNORE INTO retry_history
(job_attempt_id, retry_count, retry_status, retry_timestamp, detail)
SELECT id, 1, 'FAILED', '2026-01-01 00:03:00',
       'Sample retry completed but the upstream timeout persisted.'
FROM job_attempt
WHERE tenant_id = 'TenantA'
  AND report_name = 'MonthlyReport'
  AND schedule_time = '2026-01-01 00:00:00'
  AND attempt_number = 1
  AND status = 'FAILED'
UNION ALL
SELECT id, 1, 'FAILED', '2026-01-01 00:06:00',
       'Sample retry exhausted after a second upstream timeout.'
FROM job_attempt
WHERE tenant_id = 'TenantA'
  AND report_name = 'MonthlyReport'
  AND schedule_time = '2026-01-01 00:00:00'
  AND attempt_number = 2
  AND status = 'FAILED'
UNION ALL
SELECT id, 1, 'FAILED', '2026-01-04 00:07:00',
       'Sample retry completed but the gateway timeout persisted.'
FROM job_attempt
WHERE tenant_id = 'TenantC'
  AND report_name = 'WeeklyReport'
  AND schedule_time = '2026-01-04 00:00:00'
  AND attempt_number = 1
  AND status = 'TIMEOUT';
