import { useCallback, useEffect, useState } from "react";
import { ArrowForwardRounded, RefreshRounded, ReportProblemOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { getErrorMessage } from "../services/api";
import { jobService } from "../services/jobService";
import type { UndeliveredReport } from "../types";
import { formatDate } from "../utils/format";
import { StatusChip } from "../components/StatusChip";
import { EmptyState, LoadingState } from "../components/PageState";
import { Link } from "react-router-dom";

export function ReportsPage() {
  const [reports, setReports] = useState<UndeliveredReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setReports(await jobService.getUndelivered());
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <Stack spacing={3}>
      <Box className="page-heading">
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: 25, sm: 30 } }}>Undelivered reports</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.6 }}>Scheduled report groups without a successful attempt.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshRounded />} onClick={() => void load()}>Refresh</Button>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      <Card>
        <CardContent>
          <Box className="section-heading" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6">Delivery exceptions</Typography>
              <Typography variant="body2" color="text.secondary">{reports.length} report group{reports.length === 1 ? "" : "s"} need attention</Typography>
            </Box>
            <ReportProblemOutlined color="warning" />
          </Box>
          {loading ? <LoadingState /> : reports.length === 0 ? (
            <EmptyState>All recorded report groups have at least one successful attempt.</EmptyState>
          ) : (
            <Box className="responsive-table">
              <table className="data-table">
                <thead><tr><th>REPORT / TENANT</th><th>SCHEDULED</th><th>ATTEMPTS</th><th>LATEST STATUS</th><th>CLASSIFICATION</th><th></th></tr></thead>
                <tbody>{reports.map((report) => (
                  <tr key={`${report.tenantId}-${report.reportName}-${report.scheduleTime}`}>
                    <td><strong>{report.reportName}</strong><small>{report.tenantId}</small></td>
                    <td className="muted-cell">{formatDate(report.scheduleTime)}</td>
                    <td>{report.attempts}</td>
                    <td>{report.latestStatus}</td>
                    <td><StatusChip value={report.finalClassification} /></td>
                    <td><Button component={Link} to="/attempts" size="small" endIcon={<ArrowForwardRounded />}>Attempts</Button></td>
                  </tr>
                ))}</tbody>
              </table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
