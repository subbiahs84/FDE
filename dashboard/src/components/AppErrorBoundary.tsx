import { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Dashboard rendering error", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ maxWidth: 560, mx: "auto", mt: 10, p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            The dashboard encountered an unexpected error.
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Reload the page to try again.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload dashboard
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
