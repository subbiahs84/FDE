import { Avatar, Box, Card, CardContent, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

interface Props {
  label: string;
  value: string | number;
  helper: string;
  icon: SvgIconComponent;
  tone: string;
}

export function MetricCard({ label, value, helper, icon: Icon, tone }: Props) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={550}>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1.2, fontSize: { xs: 28, sm: 32 } }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${tone}14`, color: tone, width: 42, height: 42 }}>
            <Icon fontSize="small" />
          </Avatar>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.25 }}>
          {helper}
        </Typography>
      </CardContent>
    </Card>
  );
}
