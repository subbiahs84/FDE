import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AddRounded,
  AutorenewRounded,
  RefreshRounded,
  SearchRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { getErrorMessage } from "../services/api";
import { jobService } from "../services/jobService";
import type { Classification, JobAttempt, JobAttemptInput } from "../types";
import { formatDate } from "../utils/format";
import { StatusChip } from "../components/StatusChip";
import { useToast } from "../components/ToastContext";

export function AttemptsPage() {
  const [rows, setRows] = useState<JobAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const hasLoaded = useRef(false);
  const [form, setForm] = useState<JobAttemptInput>({
    tenantId: "",
    reportName: "",
    scheduleTime: "",
    attemptNumber: 1,
    status: "SUCCESS",
    errorCode: "",
  });
  const notify = useToast();

  const load = useCallback(async () => {
    setLoading(!hasLoaded.current);
    setRefreshing(hasLoaded.current);
    setError("");
    try {
      setRows(await jobService.getAttempts());
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      hasLoaded.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filteredRows = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      [row.tenantId, row.reportName, row.status, row.errorCode ?? "", String(row.id)]
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [filter, rows]);

  const handleRetry = async (id: number) => {
    setBusyId(id);
    try {
      const result = await jobService.requestRetry(id);
      notify(`Retry request ${result.retryCount}/${result.maxRetries} accepted for attempt #${id}.`, "success");
    } catch (cause) {
      notify(getErrorMessage(cause), "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    try {
      const created = await jobService.createAttempt({
        ...form,
        scheduleTime: form.scheduleTime,
        attemptNumber: Number(form.attemptNumber),
        errorCode: form.errorCode?.trim() || undefined,
      });
      setRows((current) => [created, ...current]);
      setCreateOpen(false);
      setForm({ tenantId: "", reportName: "", scheduleTime: "", attemptNumber: 1, status: "SUCCESS", errorCode: "" });
      notify(`Attempt #${created.id} was recorded.`, "success");
    } catch (cause) {
      notify(getErrorMessage(cause), "error");
    } finally {
      setCreating(false);
    }
  };

  const columns = useMemo<GridColDef<JobAttempt>[]>(() => [
    { field: "id", headerName: "ID", width: 82 },
    { field: "reportName", headerName: "Report", minWidth: 170, flex: 1 },
    { field: "tenantId", headerName: "Tenant", minWidth: 125, flex: 0.7 },
    { field: "scheduleTime", headerName: "Scheduled", minWidth: 170, valueFormatter: (value) => formatDate(value) },
    { field: "attemptNumber", headerName: "Attempt", width: 94, valueFormatter: (value) => `#${value}` },
    { field: "status", headerName: "Status", minWidth: 140 },
    {
      field: "classification",
      headerName: "Classification",
      minWidth: 185,
      renderCell: ({ value }) => <StatusChip value={value as Classification} />,
    },
    { field: "errorCode", headerName: "Error code", minWidth: 150, flex: 0.8, valueGetter: (_value, row) => row.errorCode || "—" },
    {
      field: "actions",
      headerName: "Action",
      width: 132,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => row.classification === "RETRYABLE_FAILURE" ? (
        <Button
          size="small"
          startIcon={<AutorenewRounded />}
          disabled={busyId === row.id}
          onClick={() => void handleRetry(row.id)}
        >
          {busyId === row.id ? "Sending" : "Request"}
        </Button>
      ) : <Typography variant="caption" color="text.disabled">—</Typography>,
    },
  ], [busyId]);

  return (
    <Stack spacing={3}>
      <Box className="page-heading">
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: 25, sm: 30 } }}>Job attempts</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.6 }}>Inspect execution history and request bounded retries for eligible failures.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshRounded />} onClick={() => void load()} disabled={refreshing}>
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
          <Button variant="contained" startIcon={<AddRounded />} onClick={() => setCreateOpen(true)}>New attempt</Button>
        </Stack>
      </Box>
      {error && <Alert severity="error" action={<Button color="inherit" onClick={() => void load()}>Retry</Button>}>{error}</Alert>}
      <Card>
        <CardContent>
          <Box className="section-heading" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6">Execution history</Typography>
              <Typography variant="body2" color="text.secondary">{rows.length} recorded attempt{rows.length === 1 ? "" : "s"}</Typography>
            </Box>
            <TextField
              size="small"
              placeholder="Search attempts"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              sx={{ width: { xs: "100%", sm: 250 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> }}
            />
          </Box>
          <Box sx={{ width: "100%" }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              loading={loading}
              autoHeight
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              disableRowSelectionOnClick
              sx={{ minHeight: 420, "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": { outline: "none" } }}
              slots={{
                noRowsOverlay: () => <Box className="grid-empty">No attempts match this search.</Box>,
              }}
            />
          </Box>
          <Chip
            size="small"
            variant="outlined"
            label="Retry requests are recorded as ACCEPTED for a report-runner integration."
            sx={{ mt: 2 }}
          />
        </CardContent>
      </Card>
      <Dialog open={createOpen} onClose={() => !creating && setCreateOpen(false)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={(event: FormEvent<HTMLFormElement>) => void handleCreate(event)}>
          <DialogTitle>Record a job attempt</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add a report execution to the reliability history.
            </Typography>
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <TextField
                label="Tenant"
                required
                inputProps={{ maxLength: 100 }}
                value={form.tenantId}
                onChange={(event) => setForm({ ...form, tenantId: event.target.value })}
              />
              <TextField
                label="Report name"
                required
                inputProps={{ maxLength: 150 }}
                value={form.reportName}
                onChange={(event) => setForm({ ...form, reportName: event.target.value })}
              />
              <TextField
                label="Scheduled time"
                type="datetime-local"
                required
                InputLabelProps={{ shrink: true }}
                value={form.scheduleTime}
                onChange={(event) => setForm({ ...form, scheduleTime: event.target.value })}
              />
              <Box className="form-grid">
                <TextField
                  label="Attempt number"
                  type="number"
                  required
                  inputProps={{ min: 1 }}
                  value={form.attemptNumber}
                  onChange={(event) => setForm({ ...form, attemptNumber: Number(event.target.value) })}
                />
                <TextField
                  select
                  label="Status"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                >
                  {["SUCCESS", "FAILED", "ERROR", "TIMEOUT", "RETRY_EXHAUSTED", "PROVIDER_PENDING"].map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </TextField>
              </Box>
              <TextField
                label="Error code"
                inputProps={{ maxLength: 120 }}
                value={form.errorCode}
                onChange={(event) => setForm({ ...form, errorCode: event.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={creating}>
              {creating ? "Saving…" : "Record attempt"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
}
