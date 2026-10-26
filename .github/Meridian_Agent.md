You are a Principal Solutions Architect, Staff Software Engineer, Site Reliability Engineer, and Product Architect.
 
Your task is to build a complete working solution for the following case study.
 
=====================================================
CASE STUDY
=====================================================
 
MERIDIAN PAYMENTS
 
Business Problem:
 
Meridian Payments generates scheduled financial statements for business customers.
 
A job runner executes report-generation jobs and logs each execution attempt.
 
Current challenge:
 
"Every so often a tenant’s scheduled report just doesn’t show up, and we only find out when they email asking where it is.
 
Our job runner logs every attempt with a status, but nobody is proactively watching it.
 
I want something that looks at our job history, works out which report runs never succeeded, and ideally retries the ones that are safe to retry before a customer notices.
 
What counts as ‘failed’ isn’t consistent in our logs."
 
The goal is to build an Autonomous Report Reliability Platform.
 
=====================================================
ASSESSMENT CRITERIA
=====================================================
 
The solution must demonstrate:
 
1. Handling ambiguity
2. Sound architecture decisions
3. Real-world design
4. Customer-centric thinking
5. Reliability engineering
6. Observability
7. Scalability
8. Maintainability
9. Clean code
10. Clear documentation
 
=====================================================
TECHNICAL ENVIRONMENT
=====================================================
 
Use:
 
- Java 25 (LTS)
- Spring Boot 3.x
- Maven
- MySQL
- Docker
- JUnit 5
- Lombok
- Spring Data JPA
- Spring Retry
- Validation API
 
Optional:
- Kafka
- Micrometer
- Prometheus
- Grafana
 
=====================================================
FUNCTIONAL REQUIREMENTS
=====================================================
 
1. Read historical job-attempt records.
 
2. Detect report executions that never completed successfully.
 
3. Support inconsistent statuses.
 
Examples:
 
SUCCESS
COMPLETED
DELIVERED
 
FAILED
ERROR
TIMEOUT
RETRY_EXHAUSTED
 
WARNING
COMPLETED_WITH_WARNING
 
UNKNOWN statuses must be handled gracefully.
 
4. Classify results into:
 
SUCCESS
RETRYABLE_FAILURE
NON_RETRYABLE_FAILURE
UNKNOWN
 
5. Detect missing successful report runs.
 
Example:
 
Tenant A
Monthly Statement
Scheduled 01-Jan
 
Attempt 1 = FAILED
Attempt 2 = FAILED
 
Final Result:
UNDELIVERED REPORT
 
6. Retry only retryable failures.
 
Retryable examples:
 
TIMEOUT
NETWORK_ERROR
SERVICE_UNAVAILABLE
 
Do not retry:
 
INVALID_CONFIGURATION
TEMPLATE_MISSING
PERMISSION_DENIED
 
7. Maximum retry count = 3
 
8. Maintain retry history.
 
9. Produce audit records.
 
10. Generate operational metrics.
 
=====================================================
NON-FUNCTIONAL REQUIREMENTS
=====================================================
 
Design for:
 
- Scalability
- Reliability
- Maintainability
- Auditability
- Extensibility
- Security
- Observability
 
=====================================================
ASSUMPTIONS
=====================================================
 
Since requirements are intentionally ambiguous:
 
Create a configurable Failure Classification Engine.
 
Do NOT hardcode status mappings.
 
Store mappings in:
 
classification_rules table
 
Example:
 
ERROR -> RETRYABLE_FAILURE
TIMEOUT -> RETRYABLE_FAILURE
SUCCESS -> SUCCESS
PERMISSION_DENIED -> NON_RETRYABLE_FAILURE
 
Unknown statuses must be flagged.
 
=====================================================
EXPECTED ARCHITECTURE
=====================================================
 
Use clean architecture.
 
Recommended packages:
 
controller
service
repository
entity
dto
config
scheduler
retry
classifier
exception
metrics
 
Flow:
 
Job Logs
    |
    V
Classification Engine
    |
    V
Missing Success Detection
    |
    V
Retry Decision Engine
    |
    V
Retry Executor
    |
    +--> Audit Store
    |
    +--> Metrics
    |
    +--> Alerts
 
=====================================================
DATABASE DESIGN
=====================================================
 
Create entities and DDL scripts.
 
Tables:
 
job_attempt
 
Fields:
id
tenant_id
report_name
schedule_time
attempt_number
status
error_code
execution_time
 
classification_rule
 
Fields:
id
status
classification
 
retry_history
 
Fields:
id
job_attempt_id
retry_count
retry_status
retry_timestamp
 
audit_event
 
Fields:
id
event_type
description
created_timestamp
 
=====================================================
REST APIs
=====================================================
 
Create APIs.
 
GET /api/jobs/failed
 
Returns all undelivered reports.
 
GET /api/jobs/unknown-statuses
 
Returns statuses not mapped.
 
POST /api/jobs/retry/{jobId}
 
Triggers retry.
 
GET /api/metrics
 
Returns operational metrics.
 
=====================================================
METRICS
=====================================================
 
Expose:
 
Total Jobs
 
Successful Jobs
 
Failed Jobs
 
Retryable Failures
 
Unknown Statuses
 
Retry Success Rate
 
Undelivered Reports
 
=====================================================
SAMPLE INPUT
=====================================================
 
Provide sample CSV and JSON seed data.
 
Examples:
 
TenantA,MonthlyReport,1,FAILED
TenantA,MonthlyReport,2,FAILED
 
TenantB,DailyReport,1,FAILED
TenantB,DailyReport,2,SUCCESS
 
TenantC,WeeklyReport,1,TIMEOUT
 
=====================================================
DETECTION LOGIC
=====================================================
 
Implement algorithm:
 
Group By:
Tenant
Report
Schedule Date
 
Rules:
 
If any SUCCESS exists:
Final Status = SUCCESS
 
Else if latest status is retryable:
Final Status = RETRYABLE_FAILURE
 
Else:
Final Status = NON_RETRYABLE_FAILURE
 
If no success exists:
Mark as UNDelivered.
 
=====================================================
IMPLEMENTATION REQUIREMENTS
=====================================================
 
Generate complete code.
 
Include:
 
1. Maven project structure
 
2. pom.xml
 
3. application.yml
 
4. Entities
 
5. DTOs
 
6. Repositories
 
7. Services
 
8. Controllers
 
9. Retry Engine
 
10. Classification Engine
 
11. Exception Handling
 
12. Global Error Handler
 
13. Unit Tests
 
14. Integration Tests
 
15. Dockerfile
 
16. docker-compose.yml
 
17. SQL scripts
 
18. Seed data
 
19. README.md
 
20. SOLUTION_DESIGN.md
 
=====================================================
SOLUTION_DESIGN.MD FORMAT
=====================================================
 
Create a professional 2-page architecture document containing:
 
1. Problem Restatement
 
2. Assumptions
 
3. Architecture Diagram
 
4. Component Description
 
5. Failure Classification Strategy
 
6. Retry Strategy
 
7. Trade-offs
 
8. Alternative Designs Considered
 
9. Scaling Strategy
 
10. Observability Strategy
 
11. Future Enhancements
 
Future enhancements should include:
 
- Kafka event streaming
- AI anomaly detection
- Predictive failure analysis
- Tenant-specific retry policies
- Self-healing workflows
 
=====================================================
README.MD FORMAT
=====================================================
 
Include:
 
Project Overview
 
Architecture
 
Technology Stack
 
How to Run
 
Database Setup
 
Docker Setup
 
API Examples
 
Testing Instructions
 
Known Limitations
 
Future Improvements
 
=====================================================
ARCHITECT EXPECTATIONS
=====================================================
 
Use enterprise-grade coding standards.
 
Use SOLID principles.
 
Use clean architecture.
 
Use proper logging.
 
Use constructor injection.
 
Use proper validation.
 
Use configuration properties.
 
Avoid hardcoded values.
 
Focus on reliability engineering, observability, and operational excellence.
 
The design should feel like a real banking/payment platform component, not a coding exercise.
 
Generate all code, folder structure, documentation, diagrams (Mermaid format), test cases, sample data, and deployment files.