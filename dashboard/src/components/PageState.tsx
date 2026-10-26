import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function LoadingState({ label = "Loading report data…" }: { label?: string }) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: 260 }}>
      <CircularProgress size={28} />
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Stack>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return <Alert severity="error" action={<button className="text-action" onClick={onRetry}>Retry</button>}>{message}</Alert>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ py: 7, textAlign: "center" }}>
      <Typography variant="body2" color="text.secondary">{children}</Typography>
    </Box>
  );
}
