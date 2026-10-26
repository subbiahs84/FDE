import { createTheme } from "@mui/material/styles";
import "@mui/x-data-grid/themeAugmentation";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#4263eb", dark: "#3049b4", light: "#edf1ff" },
    secondary: { main: "#11a88a" },
    background: { default: "#f5f7fb", paper: "#ffffff" },
    text: { primary: "#182230", secondary: "#697586" },
    success: { main: "#159570" },
    warning: { main: "#dd8b18" },
    error: { main: "#d64c55" },
    divider: "#e9edf3",
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    h4: { fontWeight: 700, letterSpacing: "-0.035em" },
    h5: { fontWeight: 700, letterSpacing: "-0.025em" },
    h6: { fontWeight: 650, letterSpacing: "-0.02em" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #e9edf3",
          boxShadow: "0 4px 16px rgba(23, 35, 58, 0.035)",
        },
      },
    },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiDataGrid: {
      styleOverrides: {
        root: { border: 0 },
        columnHeaders: { backgroundColor: "#f8f9fc" },
      },
    },
  },
});
