import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WorkspaceDetailPage from "./pages/Workspaces/WorkspaceDetailPage";
import ProjectDetailPage from "./pages/Project/DetailProject";
import Layout from "./components/Layout";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./pages/Login";
import AcceptPicInvite from "./pages/AcceptPicInvite";
import AcceptWorkspaceInvite from "./pages/AcceptWorkspaceInvite";
import Dashboard from "./pages/Dashboard";
import Kuarter from "./pages/Kuarter/Index";
import MyWork from "./pages/Workspaces/MyWorkspaces";
import KuarterDetail from "./pages/Kuarter/KuarterDetail";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetPassword from "./pages/VerifyResetPassword";
import AuthPages from "./pages/AuthPages";
import { RecentUpdatesProvider } from "./context/RecentlyContext";
import { NotificationProvider } from "./context/NotificationContext";
import MajorTask from "./pages/MajorTask/Index";
import ReportPage from "./pages/Report/Index";
import UserManagement from "./pages/UserManagement/UserManagement";
import IndexFacilities from "./pages/BookingMeeting/Facilities/Index";
import IndexRooms from "./pages/BookingMeeting/Rooms/Index";
import IndexBooking from "./pages/BookingMeeting/MeetingManagement/Index";
import IndexMySchedule from "./pages/BookingMeeting/MySchedule/Index";
import MeetingRecapPage from "./pages/BookingMeeting/MeetingRecap/Index";
export default function App() {
  if (import.meta.env.MODE === "development") {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
  }
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <NotificationProvider>
          <RecentUpdatesProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/forgot-password" element={<AuthPages />} />
                <Route path="/verify-reset-password" element={<AuthPages />} />
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<AuthPages />} />
                <Route
                  path="/accept-pic-invite"
                  element={<AcceptPicInvite />}
                />
                <Route
                  path="/accept-workspace-invite"
                  element={<AcceptWorkspaceInvite />}
                />

                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route
                      path="/user-management"
                      element={<UserManagement />}
                    />
                    <Route path="/major-task" element={<MajorTask />} />
                    <Route path="/reports" element={<ReportPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/mywork" element={<MyWork />} />
                    <Route path="/kuarter" element={<Kuarter />} />
                    <Route path="/kuarter/:id" element={<KuarterDetail />} />;
                    <Route
                      path="/workspaces/:id"
                      element={<WorkspaceDetailPage />}
                    />
                    <Route
                      path="/project/:id"
                      element={<ProjectDetailPage />}
                    />
                    <Route
                      path="/master-data/facilities"
                      element={<IndexFacilities />}
                    />
                    <Route path="/master-data/rooms" element={<IndexRooms />} />
                    <Route path="/booking-room" element={<IndexBooking />} />
                    <Route
                      path="/schedule-meeting"
                      element={<IndexMySchedule />}
                    />
                    <Route
                      path="/meeting-recap"
                      element={<MeetingRecapPage />}
                    />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </RecentUpdatesProvider>
        </NotificationProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
