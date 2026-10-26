// Runtime validation coverage for: dashboard API requests and response handling.
import { beforeEach, describe, expect, it, vi } from "vitest";

const { get, post } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("./api", () => ({ api: { get, post } }));

import { jobService } from "./jobService";

describe("jobService", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it("loads job attempts from the existing jobs endpoint", async () => {
    const attempts = [{ id: 17, status: "TIMEOUT" }];
    get.mockResolvedValue({ data: attempts });

    await expect(jobService.getAttempts()).resolves.toEqual(attempts);
    expect(get).toHaveBeenCalledWith("/api/jobs");
  });

  it("loads operational metrics from the existing metrics endpoint", async () => {
    const metrics = { totalJobs: 7, retryableFailures: 2 };
    get.mockResolvedValue({ data: metrics });

    await expect(jobService.getMetrics()).resolves.toEqual(metrics);
    expect(get).toHaveBeenCalledWith("/api/metrics");
  });

  it("requests a retry for the selected attempt without claiming execution", async () => {
    const result = { jobAttemptId: 17, retryCount: 1, maxRetries: 3, status: "ACCEPTED" };
    post.mockResolvedValue({ data: result });

    await expect(jobService.requestRetry(17)).resolves.toEqual(result);
    expect(post).toHaveBeenCalledWith("/api/jobs/retry/17");
  });
});
