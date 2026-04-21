import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const MargaritaFlower = () => (
  <svg width="48" height="48" viewBox="0 0 100 100">
    <g transform="translate(50,50)">
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy="-26"
          rx="8"
          ry="16"
          fill="#f9eae7"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="11" fill="#D4A843" />
    </g>
  </svg>
);

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "El nombre es obligatorio";
    if (!form.email.trim()) e.email = "El email es obligatorio";
    if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    const result = await register(form.name, form.email, form.password);
    if (result.success) navigate(from, { replace: true });
    setIsSubmitting(false);
  };

  const inputClass = (field) =>
    `w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cin-300 bg-cin-50 text-sm text-cin-800 placeholder-cin-300 ${errors[field] ? "border-red-300 bg-red-50" : "border-cin-200"}`;

  return (
    <div className="min-h-screen bg-cin-100 flex flex-col">
      <div className="p-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-cin-500 hover:text-cin-700 text-sm font-medium transition-colors"
        >
          <FaArrowLeft size={11} /> Volver a la tienda
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-sm border border-cin-200 overflow-hidden">
            <div className="bg-cin-200 px-8 py-8 text-center">
              <div className="flex justify-center mb-3">
                <MargaritaFlower />
              </div>
              <h1 className="font-display text-2xl text-cin-800">
                Crear cuenta
              </h1>
              <p className="text-cin-600 text-sm mt-1">
                Seguí tus pedidos y comprá más rápido
              </p>
            </div>

            <div className="px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <FaUser
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-300"
                      size={13}
                    />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Tu nombre"
                      value={form.name}
                      onChange={handleChange}
                      className={inputClass("name")}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FaEnvelope
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-300"
                      size={13}
                    />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="tu@email.com"
                      value={form.email}
                      onChange={handleChange}
                      className={inputClass("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <FaLock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-300"
                      size={13}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={handleChange}
                      className={`${inputClass("password")} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cin-300 hover:text-cin-500"
                    >
                      {showPassword ? (
                        <FaEyeSlash size={13} />
                      ) : (
                        <FaEye size={13} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <FaLock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-300"
                      size={13}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      placeholder="Repetí tu contraseña"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className={inputClass("confirmPassword")}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cin-700 hover:bg-cin-800 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Crear mi cuenta"
                  )}
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cin-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-cin-400">
                    ¿Ya tenés cuenta?
                  </span>
                </div>
              </div>

              <Link
                to="/login"
                state={{ from }}
                className="w-full flex items-center justify-center py-3 border border-cin-300 text-cin-700 font-medium rounded-xl hover:bg-cin-50 transition-colors text-sm"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
