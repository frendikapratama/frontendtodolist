import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WorkspaceDetailPage from "./pages/Workspaces/WorkspaceDetailPage";
import ProjectDetailPage from "./pages/Project/DetailProject";
import Layout from "./components/Layout";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./pages/Login";
import AcceptPicInvite from "./pages/AcceptPicInvite";
import Dashboard from "./pages/Dashboard";
import Kuarter from "./pages/Kuarter/Index";
import KuarterDetail from "./pages/Kuarter/KuarterDetail";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetPassword from "./pages/VerifyResetPassword";
import AuthPages from "./pages/AuthPages"
import { RecentUpdatesProvider } from "./context/RecentlyContext";
export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <RecentUpdatesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/forgot-password" element={<AuthPages />} />
              <Route
                path="/verify-reset-password"
                element={<AuthPages />}
              />
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<AuthPages />} />
              <Route path="/accept-pic-invite" element={<AcceptPicInvite />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/kuarter" element={<Kuarter />} />
                  <Route path="/kuarter/:id" element={<KuarterDetail />} />;
                  <Route
                    path="/workspaces/:id"
                    element={<WorkspaceDetailPage />}
                  />
                  <Route path="/project/:id" element={<ProjectDetailPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </RecentUpdatesProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
