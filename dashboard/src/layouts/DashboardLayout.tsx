import { useState, type ReactNode } from "react";
import {
  AssessmentOutlined,
  AutorenewRounded,
  BarChartRounded,
  DashboardRounded,
  MenuRounded,
  MonitorHeartRounded,
  TableRowsRounded,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const drawerWidth = 248;

const navigation = [
  { label: "Overview", path: "/", icon: DashboardRounded },
  { label: "Job attempts", path: "/attempts", icon: TableRowsRounded },
  { label: "Undelivered reports", path: "/reports", icon: AssessmentOutlined },
  { label: "Monitoring", path: "/monitoring", icon: MonitorHeartRounded },
];

interface Props {
  children: ReactNode;
}

export function DashboardLayout({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const current = navigation.find((item) => item.path === location.pathname)?.label ?? "Overview";

  const sidebar = (
    <Box className="sidebar">
      <Box className="brand">
        <Box className="brand-mark"><BarChartRounded /></Box>
        <Box>
          <Typography fontWeight={750} fontSize={16} color="white">meridian</Typography>
          <Typography className="brand-caption">REPORT OPERATIONS</Typography>
        </Box>
      </Box>
      <Typography className="nav-caption">WORKSPACE</Typography>
      <List disablePadding>
        {navigation.map(({ label, path, icon: Icon }) => (
          <ListItemButton
            key={path}
            component={NavLink}
            to={path}
            onClick={() => setMobileOpen(false)}
            className="nav-item"
            end={path === "/"}
          >
            <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
      <Box className="sidebar-bottom">
        <Divider sx={{ borderColor: "rgba(255,255,255,.1)", mb: 2 }} />
        <Box className="sidebar-note">
          <AutorenewRounded fontSize="small" />
          <Typography variant="caption">Retry requests are queued for your report runner.</Typography>
        </Box>
        <Box className="profile">
          <Avatar sx={{ width: 34, height: 34, bgcolor: "#566ee8", fontSize: 13 }}>MO</Avatar>
          <Box>
            <Typography variant="body2" color="white" fontWeight={600}>Operations</Typography>
            <Typography variant="caption" color="rgba(255,255,255,.52)">Reliability team</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box className="app-shell">
      {isMobile ? (
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { width: drawerWidth, bgcolor: "#111b2d" } }}>
          {sidebar}
        </Drawer>
      ) : (
        <Box className="desktop-sidebar" sx={{ width: drawerWidth }}>{sidebar}</Box>
      )}
      <Box className="main-column" sx={{ ml: { md: `${drawerWidth}px` } }}>
        <AppBar className="topbar" position="sticky" color="inherit" elevation={0}>
          <Toolbar className="toolbar">
            {isMobile && <IconButton onClick={() => setMobileOpen(true)} aria-label="Open navigation"><MenuRounded /></IconButton>}
            <Box className="breadcrumb">
              <Typography variant="body2" color="text.secondary">Workspace</Typography>
              <Typography variant="body2" color="text.disabled">/</Typography>
              <Typography variant="body2" fontWeight={650}>{current}</Typography>
            </Box>
            <Box className="topbar-actions">
              <Tooltip title="Reliability operations">
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#e9edff", color: "#4263eb", fontSize: 12, fontWeight: 700 }}>RO</Avatar>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>
        <Box component="main" className="page-content">{children}</Box>
        <Box component="footer" className="footer">
          <Typography variant="caption">Meridian Report Reliability</Typography>
          <Typography variant="caption">Operational visibility for scheduled reports</Typography>
        </Box>
      </Box>
    </Box>
  );
}
