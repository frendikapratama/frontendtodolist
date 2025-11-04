import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WorkspaceIndex from "./pages/Workspace/Index";
import WorkspaceDetailPage from "./pages/Workspace/WorkspaceDetailPage";
import ProjectDetailPage from "./pages/Project/DetailProject";
import Layout from "./components/Layout";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./pages/Login";
import AcceptPicInvite from "./pages/AcceptPicInvite";
import Dashboard from "./pages/Dashboard";
export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/accept-pic-invite" element={<AcceptPicInvite />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/workspaces" element={<WorkspaceIndex />} />
                <Route
                  path="/workspaces/:id"
                  element={<WorkspaceDetailPage />}
                />
                <Route path="/project/:id" element={<ProjectDetailPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
