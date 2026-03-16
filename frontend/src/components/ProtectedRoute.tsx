import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "../state/AppContext";

export function ProtectedRoute({ role }: { role?: "ADMIN" | "USER" }) {
  const { user } = useAppContext();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
