CREATE TABLE IF NOT EXISTS job_attempt (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    report_name VARCHAR(150) NOT NULL,
    schedule_time DATETIME NOT NULL,
    attempt_number INT NOT NULL,
    status VARCHAR(80) NOT NULL,
    error_code VARCHAR(120),
    execution_time TIMESTAMP(6) NULL,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_job_attempt_number UNIQUE (tenant_id, report_name, schedule_time, attempt_number),
    INDEX idx_job_group (tenant_id, report_name, schedule_time),
    INDEX idx_job_status (status)
);

CREATE TABLE IF NOT EXISTS classification_rule (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(80) NOT NULL,
    classification VARCHAR(40) NOT NULL,
    CONSTRAINT uk_classification_rule_status UNIQUE (status)
);

CREATE TABLE IF NOT EXISTS retry_history (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    job_attempt_id BIGINT NOT NULL,
    retry_count INT NOT NULL,
    retry_status VARCHAR(30) NOT NULL,
    retry_timestamp TIMESTAMP(6) NOT NULL,
    detail VARCHAR(500),
    CONSTRAINT fk_retry_job_attempt FOREIGN KEY (job_attempt_id) REFERENCES job_attempt(id),
    CONSTRAINT uk_retry_count UNIQUE (job_attempt_id, retry_count),
    INDEX idx_retry_job (job_attempt_id)
);

CREATE TABLE IF NOT EXISTS audit_event (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(80) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    created_timestamp TIMESTAMP(6) NOT NULL,
    INDEX idx_audit_created (created_timestamp)
);
