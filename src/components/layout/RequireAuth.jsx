import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RequireAuth = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-cin-950">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-cin-500 border-t-transparent" />
      </div>
    );
  }

  // No autenticado → login admin
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Autenticado pero NO es admin (es customer) → home público
  // Evita que un cliente logueado acceda al panel
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
