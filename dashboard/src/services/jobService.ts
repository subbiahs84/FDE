import { api } from "./api";
import type {
  HealthResponse,
  JobAttempt,
  JobAttemptInput,
  OperationalMetrics,
  RetryResponse,
  UndeliveredReport,
  UnknownStatus,
} from "../types";

export const jobService = {
  async getAttempts() {
    const response = await api.get<JobAttempt[]>("/api/jobs");
    return response.data;
  },
  async getMetrics() {
    const response = await api.get<OperationalMetrics>("/api/metrics");
    return response.data;
  },
  async getUndelivered() {
    const response = await api.get<UndeliveredReport[]>("/api/jobs/failed");
    return response.data;
  },
  async getUnknownStatuses() {
    const response = await api.get<UnknownStatus[]>("/api/jobs/unknown-statuses");
    return response.data;
  },
  async getHealth() {
    const response = await api.get<HealthResponse>("/actuator/health");
    return response.data;
  },
  async createAttempt(attempt: JobAttemptInput) {
    const response = await api.post<JobAttempt>("/api/jobs/attempts", attempt);
    return response.data;
  },
  async requestRetry(id: number) {
    const response = await api.post<RetryResponse>(`/api/jobs/retry/${id}`);
    return response.data;
  },
};
