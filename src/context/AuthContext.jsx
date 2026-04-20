import React, { createContext, useState, useEffect, useContext } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Al recargar, si hay token verificamos el perfil real
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const { data } = await axiosClient.get("/users/profile");
          setUser(data);
        } catch {
          // Token expirado o inválido — limpiamos
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, [token]);

  // ─── Helper interno ────────────────────────────────────────────────────
  const saveSession = (data) => {
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data);
  };

  // ─── LOGIN (admin y clientes) ──────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const { data } = await axiosClient.post("/users/login", {
        email,
        password,
      });
      saveSession(data);
      toast.success(`Bienvenido, ${data.name} 👋`);
      return { success: true, role: data.role };
    } catch (error) {
      const msg =
        error.response?.data?.message || "Email o contraseña incorrectos";
      toast.error(msg);
      return { success: false };
    }
  };

  // ─── REGISTRO CLIENTE ──────────────────────────────────────────────────
  const register = async (name, email, password) => {
    try {
      const { data } = await axiosClient.post("/users/register", {
        name,
        email,
        password,
      });
      saveSession(data);
      toast.success(`¡Cuenta creada! Bienvenido, ${data.name} 🎉`);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || "Error al crear la cuenta";
      toast.error(msg);
      return { success: false };
    }
  };

  // ─── LOGOUT ────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.info("Sesión cerrada");
  };

  // ─── ACTUALIZAR DIRECCIÓN ──────────────────────────────────────────────
  const updateAddress = async (addressData) => {
    try {
      const { data } = await axiosClient.put("/users/address", addressData);
      setUser(data);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateAddress,
        isAuthenticated: !!token,
        isAdmin: user?.role === "admin",
        isCustomer: user?.role === "customer",
        isTucuman: user?.address?.isTucuman || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
