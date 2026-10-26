import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowForwardRounded,
  AutorenewRounded,
  CheckCircleOutlineRounded,
  ErrorOutlineRounded,
  MoreHorizRounded,
  PercentRounded,
  RefreshRounded,
  ScheduleRounded,
  TrendingUpRounded,
  WarningAmberRounded,
  HelpOutlineRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MetricCard } from "../components/MetricCard";
import { StatusChip } from "../components/StatusChip";
import { jobService } from "../services/jobService";
import { getErrorMessage } from "../services/api";
import type { JobAttempt, OperationalMetrics, UndeliveredReport } from "../types";
import { formatDate, formatPercent } from "../utils/format";

interface Data {
  metrics: OperationalMetrics;
  attempts: JobAttempt[];
  undelivered: UndeliveredReport[];
}

const chartColors: Record<string, string> = {
  SUCCESS: "#16a580",
  RETRYABLE_FAILURE: "#e5a33c",
  NON_RETRYABLE_FAILURE: "#d95762",
  UNKNOWN: "#8490a4",
};

export function DashboardPage() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string | null>(null);

  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const [health, metrics, attempts, undelivered] = await Promise.all([
        jobService.getHealth().catch(() => ({ status: "UNAVAILABLE" })),
        jobService.getMetrics(),
        jobService.getAttempts(),
        jobService.getUndelivered(),
      ]);
      setHealthStatus(health.status);
      setData({ metrics, attempts, undelivered });
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(true); }, [load]);

  const distribution = useMemo(() => {
    const counts = new Map<string, number>();
    data?.attempts.forEach((attempt) => {
      counts.set(attempt.classification, (counts.get(attempt.classification) ?? 0) + 1);
    });
    return [...counts.entries()].map(([name, value]) => ({ name, value }));
  }, [data]);

  const trend = useMemo(() => {
    const buckets = new Map<string, number>();
    data?.attempts.forEach((attempt) => {
      const key = attempt.scheduleTime.slice(0, 10);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });
    return [...buckets.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, attempts]) => ({
        date: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
        attempts,
      }));
  }, [data]);

  const recent = useMemo(
    () => [...(data?.attempts ?? [])].sort((a, b) => (b.executionTime ?? "").localeCompare(a.executionTime ?? "")).slice(0, 5),
    [data],
  );

  return (
    <Stack spacing={3}>
      <Box className="page-heading">
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: 25, sm: 30 } }}>Report operations</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.6 }}>
            Operational visibility into scheduled report delivery and reliability.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshRounded />} onClick={() => void load()} disabled={refreshing}>
          {refreshing ? "Refreshing" : "Refresh"}
        </Button>
        <Chip
          size="small"
          icon={healthStatus === "UP" ? <CheckCircleOutlineRounded /> : <ErrorOutlineRounded />}
          label={healthStatus ? `API ${healthStatus === "UP" ? "healthy" : "unavailable"}` : "Checking API"}
          color={healthStatus === "UP" ? "success" : healthStatus ? "error" : "default"}
          variant="outlined"
        />
      </Box>

      {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void load(true)}>Retry</Button>}>{error}</Alert>}

      <Box className="metric-grid">
        <MetricCard label="Total attempts" value={loading ? "—" : data?.metrics.totalJobs ?? "—"} helper="Recorded job executions" icon={ScheduleRounded} tone="#4263eb" />
        <MetricCard label="Successful" value={loading ? "—" : data?.metrics.successfulJobs ?? "—"} helper="Classified as delivered" icon={CheckCircleOutlineRounded} tone="#159570" />
        <MetricCard label="Retryable failures" value={loading ? "—" : data?.metrics.retryableFailures ?? "—"} helper="Eligible to request a retry" icon={AutorenewRounded} tone="#dd8b18" />
        <MetricCard label="Undelivered reports" value={loading ? "—" : data?.metrics.undeliveredReports ?? "—"} helper="No successful attempt recorded" icon={ErrorOutlineRounded} tone="#d64c55" />
        <MetricCard label="Unknown statuses" value={loading ? "—" : data?.metrics.unknownStatuses ?? "—"} helper="Need classification review" icon={HelpOutlineRounded} tone="#718096" />
        <MetricCard
          label="Retry success rate"
          value={loading || !data ? "—" : formatPercent(data.metrics.retrySuccessRate)}
          helper={!data ? "Unavailable" : data.metrics.retrySuccessRate === 0 ? "No successful retries reported" : "Among completed retries"}
          icon={PercentRounded}
          tone="#11a88a"
        />
      </Box>

      <Box className="chart-grid">
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Box className="section-heading">
              <Box>
                <Typography variant="h6">Attempt activity</Typography>
                <Typography variant="body2" color="text.secondary">Scheduled report runs by date</Typography>
              </Box>
              <Chip size="small" label="All time" variant="outlined" />
            </Box>
            <Box sx={{ height: 260, mt: 2 }}>
              {loading ? <Skeleton variant="rounded" height="100%" /> : trend.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attemptFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4263eb" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4263eb" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#edf0f5" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#8792a4", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#8792a4", fontSize: 12 }} />
                    <ChartTooltip />
                    <Area type="monotone" dataKey="attempts" name="Attempts" stroke="#4263eb" strokeWidth={2.5} fill="url(#attemptFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <Box className="empty-chart">No attempts have been recorded yet.</Box>}
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Box className="section-heading">
              <Box>
                <Typography variant="h6">Attempt classification</Typography>
                <Typography variant="body2" color="text.secondary">Current distribution across all attempts</Typography>
              </Box>
              <IconButton size="small" aria-label="Chart options"><MoreHorizRounded /></IconButton>
            </Box>
            <Box className="donut-layout">
              <Box sx={{ width: "100%", height: 220 }}>
                {loading ? <Skeleton variant="circular" width={190} height={190} sx={{ m: "15px auto" }} /> : distribution.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={62} outerRadius={90} paddingAngle={4} stroke="none">
                        {distribution.map((item) => <Cell key={item.name} fill={chartColors[item.name] ?? "#8490a4"} />)}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <Box className="empty-chart">No classification data.</Box>}
              </Box>
              <Stack spacing={1.3} className="legend-list">
                {distribution.map((item) => (
                  <Box key={item.name} className="legend-item">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box className="legend-dot" sx={{ bgcolor: chartColors[item.name] ?? "#8490a4" }} />
                      <Typography variant="caption" color="text.secondary">{item.name.replaceAll("_", " ").toLowerCase()}</Typography>
                    </Box>
                    <Typography variant="caption" fontWeight={700}>{item.value}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box className="bottom-grid">
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box className="table-header">
              <Box>
                <Typography variant="h6">Recent job attempts</Typography>
                <Typography variant="body2" color="text.secondary">Latest report execution activity</Typography>
              </Box>
              <Button component={Link} to="/attempts" endIcon={<ArrowForwardRounded />} size="small">View all</Button>
            </Box>
            <Box className="responsive-table">
              <table className="data-table">
                <thead><tr><th>REPORT / TENANT</th><th>ATTEMPT</th><th>STATUS</th><th>CLASSIFICATION</th><th>EXECUTED</th></tr></thead>
                <tbody>
                  {loading ? Array.from({ length: 4 }, (_, index) => (
                    <tr key={index}><td colSpan={5}><Skeleton /></td></tr>
                  )) : recent.length ? recent.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.reportName}</strong><small>{item.tenantId}</small></td>
                      <td>#{item.attemptNumber}</td>
                      <td><span className="status-text">{item.status}</span></td>
                      <td><StatusChip value={item.classification} /></td>
                      <td className="muted-cell">{formatDate(item.executionTime)}</td>
                    </tr>
                  )) : <tr><td colSpan={5} className="empty-cell">No job attempts yet.</td></tr>}
                </tbody>
              </table>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Box className="section-heading">
              <Box>
                <Typography variant="h6">Attention needed</Typography>
                <Typography variant="body2" color="text.secondary">Reports with no successful delivery</Typography>
              </Box>
              <WarningAmberRounded color="warning" />
            </Box>
            <Stack spacing={1.5} sx={{ mt: 2.5 }}>
              {loading ? <Skeleton height={60} /> : data?.undelivered.length ? data.undelivered.slice(0, 3).map((report) => (
                <Box key={`${report.tenantId}-${report.reportName}-${report.scheduleTime}`} className="attention-item">
                  <Box className="attention-icon"><ErrorOutlineRounded fontSize="small" /></Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={650} noWrap>{report.reportName}</Typography>
                    <Typography variant="caption" color="text.secondary">{report.tenantId} · {report.attempts} attempt{report.attempts === 1 ? "" : "s"}</Typography>
                  </Box>
                  <StatusChip value={report.finalClassification} />
                </Box>
              )) : <Box className="all-clear"><CheckCircleOutlineRounded /><Typography variant="body2">All reports have a successful delivery.</Typography></Box>}
            </Stack>
            <Button component={Link} to="/reports" endIcon={<ArrowForwardRounded />} sx={{ mt: 2 }}>View undelivered reports</Button>
          </CardContent>
        </Card>
      </Box>

      <Box className="dashboard-note">
        <TrendingUpRounded fontSize="small" />
        <Typography variant="caption">
          Retry success rate: {loading ? "—" : formatPercent(data?.metrics.retrySuccessRate ?? 0)} · Requests are recorded for the report-runner handoff and do not execute reports themselves.
        </Typography>
      </Box>
    </Stack>
  );
}
