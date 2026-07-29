import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const {
    loading,
    firebaseUser,
    profile,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Checking access...
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (
    profile?.role !== "admin" &&
    profile?.role !== "superadmin"
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}