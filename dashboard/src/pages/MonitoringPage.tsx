import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CheckCircleRounded, MonitorHeartRounded, RefreshRounded, StorageRounded } from "@mui/icons-material";
import { Alert, Box, Button, Card, CardContent, Chip, Skeleton, Stack, Typography } from "@mui/material";
import { getErrorMessage } from "../services/api";
import { jobService } from "../services/jobService";
import type { HealthResponse, OperationalMetrics, UnknownStatus } from "../types";
import { titleCase } from "../utils/format";

export function MonitoringPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null);
  const [unknown, setUnknown] = useState<UnknownStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [healthResponse, metricResponse, unknownResponse] = await Promise.all([
        jobService.getHealth(),
        jobService.getMetrics(),
        jobService.getUnknownStatuses(),
      ]);
      setHealth(healthResponse);
      setMetrics(metricResponse);
      setUnknown(unknownResponse);
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const overallUp = health?.status === "UP";
  const databaseUp = health?.components?.db?.status === "UP";

  return (
    <Stack spacing={3}>
      <Box className="page-heading">
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: 25, sm: 30 } }}>System monitoring</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.6 }}>Live health checks from Spring Boot Actuator and operational metrics.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshRounded />} onClick={() => void load()}>Check now</Button>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      <Box className="monitor-grid">
        <HealthCard
          title="Spring Boot API"
          subtitle="Actuator health endpoint"
          status={health?.status}
          loading={loading}
          icon={<MonitorHeartRounded />}
        />
        <HealthCard
          title="Database connection"
          subtitle="Application database component"
          status={health?.components?.db?.status}
          loading={loading}
          icon={<StorageRounded />}
        />
        <HealthCard
          title="Metrics API"
          subtitle="Operational metrics endpoint"
          status={metrics ? "UP" : undefined}
          loading={loading}
          icon={<CheckCircleRounded />}
        />
      </Box>
      <Card>
        <CardContent>
          <Typography variant="h6">Service details</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Health state exposed by the running backend.</Typography>
          {loading ? <Skeleton height={90} /> : health?.components ? (
            <Stack divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />} spacing={0}>
              {Object.entries(health.components).map(([name, component]) => (
                <Box key={name} className="component-row">
                  <Typography variant="body2">{titleCase(name)}</Typography>
                  <Chip size="small" label={component.status} color={component.status === "UP" ? "success" : "error"} />
                </Box>
              ))}
            </Stack>
          ) : <Typography variant="body2" color="text.secondary">Detailed health components are not exposed by this backend configuration.</Typography>}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6">Unmapped statuses</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Statuses awaiting classification-rule review.</Typography>
          {loading ? <Skeleton height={80} /> : unknown.length ? (
            <Stack spacing={1}>{unknown.map((item) => (
              <Box key={item.status} className="component-row">
                <Box>
                  <Typography variant="body2" fontWeight={600}>{item.status}</Typography>
                  <Typography variant="caption" color="text.secondary">Attempts: {item.attemptIds.join(", ")}</Typography>
                </Box>
                <Chip size="small" label={`${item.occurrences} occurrence${item.occurrences === 1 ? "" : "s"}`} color="warning" variant="outlined" />
              </Box>
            ))}</Stack>
          ) : <Typography variant="body2" color="text.secondary">No unmapped statuses have been reported.</Typography>}
        </CardContent>
      </Card>
      <Typography variant="caption" color="text.secondary">
        {overallUp && databaseUp ? "API and database are healthy." : "Health indicators reflect the backend's current Actuator response."}
      </Typography>
    </Stack>
  );
}

function HealthCard({
  title,
  subtitle,
  status,
  loading,
  icon,
}: {
  title: string;
  subtitle: string;
  status?: string;
  loading: boolean;
  icon: ReactNode;
}) {
  const up = status === "UP";
  return (
    <Card>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box className={`health-icon ${up ? "up" : "down"}`}>{icon}</Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" fontWeight={650}>{title}</Typography>
          <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        </Box>
        {loading ? <Skeleton width={64} /> : (
          <Chip size="small" label={status ?? "Unavailable"} color={up ? "success" : "error"} />
        )}
      </CardContent>
    </Card>
  );
}
