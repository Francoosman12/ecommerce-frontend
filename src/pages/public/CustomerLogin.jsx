import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaLock, FaEnvelope, FaArrowLeft } from "react-icons/fa";

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

const CustomerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await login(email, password);
    if (result.success) {
      navigate(result.role === "admin" ? "/admin/dashboard" : from, {
        replace: true,
      });
    }
    setIsSubmitting(false);
  };

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
              <h1 className="font-display text-2xl text-cin-800">Bienvenida</h1>
              <p className="text-cin-600 text-sm mt-1">
                Iniciá sesión para ver tus pedidos
              </p>
            </div>

            <div className="px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      required
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-cin-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cin-300 bg-cin-50 text-sm text-cin-800 placeholder-cin-300"
                    />
                  </div>
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
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-cin-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cin-300 bg-cin-50 text-sm text-cin-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cin-700 hover:bg-cin-800 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Ingresar"
                  )}
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cin-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-cin-400">
                    ¿No tenés cuenta?
                  </span>
                </div>
              </div>

              <Link
                to="/register"
                state={{ from }}
                className="w-full flex items-center justify-center py-3 border border-cin-300 text-cin-700 font-medium rounded-xl hover:bg-cin-50 transition-colors text-sm"
              >
                Crear cuenta nueva
              </Link>

              <button
                onClick={() => navigate(from, { replace: true })}
                className="w-full mt-3 text-cin-400 hover:text-cin-600 text-sm py-2 transition-colors"
              >
                Continuar sin cuenta →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
