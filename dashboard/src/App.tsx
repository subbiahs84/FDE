import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/ToastContext";
import { LoadingState } from "./components/PageState";
import { DashboardLayout } from "./layouts/DashboardLayout";

const AttemptsPage = lazy(() => import("./pages/AttemptsPage").then((module) => ({ default: module.AttemptsPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const MonitoringPage = lazy(() => import("./pages/MonitoringPage").then((module) => ({ default: module.MonitoringPage })));
const ReportsPage = lazy(() => import("./pages/ReportsPage").then((module) => ({ default: module.ReportsPage })));

export default function App() {
  return (
    <ToastProvider>
      <DashboardLayout>
        <Suspense fallback={<LoadingState label="Loading dashboard…" />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/attempts" element={<AttemptsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </DashboardLayout>
    </ToastProvider>
  );
}
