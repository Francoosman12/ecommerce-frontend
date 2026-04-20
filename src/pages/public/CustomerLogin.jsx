import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaLock, FaEnvelope, FaArrowLeft } from "react-icons/fa";

const CustomerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si venía de otra página (ej: checkout), volvemos ahí después del login
  const from = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      // Admin → panel, cliente → a donde venía
      if (result.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate(from, { replace: true });
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header simple */}
      <div className="p-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 text-sm font-medium transition-colors"
        >
          <FaArrowLeft size={12} /> Volver a la tienda
        </Link>
      </div>

      {/* Formulario centrado */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header del card */}
            <div className="bg-indigo-600 px-8 py-8 text-center">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaLock className="text-white" size={22} />
              </div>
              <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>
              <p className="text-indigo-200 text-sm mt-1">
                Accedé a tu cuenta para ver tus pedidos
              </p>
            </div>

            {/* Form */}
            <div className="px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FaEnvelope
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={14}
                    />
                    <input
                      type="email"
                      required
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <FaLock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={14}
                    />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Ingresar"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-gray-400">
                    ¿No tenés cuenta?
                  </span>
                </div>
              </div>

              {/* Link a registro */}
              <Link
                to="/register"
                state={{ from }}
                className="w-full flex items-center justify-center py-3 border-2 border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-sm"
              >
                Crear cuenta nueva
              </Link>

              {/* Compra como guest */}
              <button
                onClick={() => navigate(from, { replace: true })}
                className="w-full mt-3 text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
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
