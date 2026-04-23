import React, { createContext, useState, useEffect, useContext } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const { data } = await axiosClient.get("/users/profile");
          setUser(data);
        } catch {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, [token]);

  const saveSession = (data) => {
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data);
  };

  const login = async (email, password) => {
    try {
      const { data } = await axiosClient.post("/users/login", {
        email,
        password,
      });
      saveSession(data);
      toast.success(`Bienvenida, ${data.name} 👋`);
      return { success: true, role: data.role };
    } catch (error) {
      const msg =
        error.response?.data?.message || "Email o contraseña incorrectos";
      toast.error(msg);
      return { success: false };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await axiosClient.post("/users/register", {
        name,
        email,
        password,
      });
      saveSession(data);
      toast.success(`¡Cuenta creada! Bienvenida, ${data.name} 🎉`);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || "Error al crear la cuenta";
      toast.error(msg);
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.info("Sesión cerrada");
  };

  const updateAddress = async (addressData) => {
    try {
      const { data } = await axiosClient.put("/users/address", addressData);
      setUser(data);
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  // Derivamos el rol directamente del user para que sea siempre consistente
  const role = user?.role || null;
  const isAdmin = role === "admin";
  const isCustomer = role === "customer";
  const isAuthenticated = !!token && !!user; // Esperamos que user esté cargado

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
        isAuthenticated,
        isAdmin,
        isCustomer,
        isTucuman: user?.address?.isTucuman || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
