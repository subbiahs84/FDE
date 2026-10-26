export type Classification =
  | "SUCCESS"
  | "RETRYABLE_FAILURE"
  | "NON_RETRYABLE_FAILURE"
  | "UNKNOWN";

export interface JobAttempt {
  id: number;
  tenantId: string;
  reportName: string;
  scheduleTime: string;
  attemptNumber: number;
  status: string;
  errorCode: string | null;
  executionTime: string | null;
  classification: Classification;
}

export interface UndeliveredReport {
  tenantId: string;
  reportName: string;
  scheduleTime: string;
  attempts: number;
  finalClassification: Classification;
  latestAttemptId: number;
  latestStatus: string;
  attemptIds: number[];
}

export interface OperationalMetrics {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  retryableFailures: number;
  unknownStatuses: number;
  retrySuccessRate: number;
  undeliveredReports: number;
}

export interface RetryResponse {
  jobAttemptId: number;
  retryCount: number;
  maxRetries: number;
  status: string;
  requestedAt: string;
}

export interface UnknownStatus {
  status: string;
  occurrences: number;
  attemptIds: number[];
}

export interface HealthResponse {
  status: string;
  components?: Record<string, { status: string }>;
}

export interface JobAttemptInput {
  tenantId: string;
  reportName: string;
  scheduleTime: string;
  attemptNumber: number;
  status: string;
  errorCode?: string;
}
