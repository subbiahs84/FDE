import { Chip } from "@mui/material";
import type { Classification } from "../types";
import { titleCase } from "../utils/format";

const palette: Record<Classification, "success" | "warning" | "error" | "default"> = {
  SUCCESS: "success",
  RETRYABLE_FAILURE: "warning",
  NON_RETRYABLE_FAILURE: "error",
  UNKNOWN: "default",
};

interface Props {
  value: Classification;
}

export function StatusChip({ value }: Props) {
  return (
    <Chip
      size="small"
      color={palette[value] ?? "default"}
      label={titleCase(value)}
      variant={value === "UNKNOWN" ? "outlined" : "filled"}
      sx={{ fontWeight: 600, borderRadius: "7px" }}
    />
  );
}
