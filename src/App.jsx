import { BrowserRouter, Routes, Route } from "react-router-dom";
import WorkspaceIndex from "./pages/Workspace/Index";
import WorkspaceDetailPage from "./pages/Workspace/WorkspaceDetailPage";
import ProjectDetailPage from "./pages/Project/DetailProject";
import Layout from "./components/Layout";
import { WorkspaceProvider } from "./context/WorkspaceContext";

export default function App() {
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/workspaces" element={<WorkspaceIndex />} />
            <Route path="/workspaces/:id" element={<WorkspaceDetailPage />} />
            <Route path="/project/:id" element={<ProjectDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WorkspaceProvider>
  );
}
