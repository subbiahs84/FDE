import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object" && "message" in data) {
      const message = data.message;
      if (typeof message === "string" && message.trim()) return message;
    }
    if (error.response) return `Request failed (${error.response.status}).`;
    if (error.code === "ECONNABORTED") return "The API request timed out.";
    return "The API could not be reached. Check that the backend is running.";
  }
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}
