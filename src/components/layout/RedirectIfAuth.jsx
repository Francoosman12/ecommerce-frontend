import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Protege rutas que NO deben verse si ya estás logueado:
 * /login, /register, /admin/login
 *
 * - Si es admin    → redirige al panel
 * - Si es customer → redirige al home
 * - Si no hay sesión → muestra la página normalmente
 */
const RedirectIfAuth = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-cin-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-cin-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    // Si es la ruta de admin/login y el usuario es customer → home
    if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
    // Si es admin → panel
    if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
    // Si es customer → home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RedirectIfAuth;
