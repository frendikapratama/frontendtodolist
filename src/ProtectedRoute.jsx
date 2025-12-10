import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading, token } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }
  if(!token){
    return <Navigate to="/login" replace />
  }

  return <Outlet />;
}