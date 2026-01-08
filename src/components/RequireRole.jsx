import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireRole({ allowed, children }) {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (!allowed.includes(role)) {
    return <Navigate to="/pos" replace />;
  }

  return children;
}
