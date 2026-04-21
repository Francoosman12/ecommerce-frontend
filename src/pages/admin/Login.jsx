import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaLock, FaEnvelope } from "react-icons/fa";

const MargaritaFlower = () => (
  <svg width="52" height="52" viewBox="0 0 100 100">
    <g transform="translate(50,50)">
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy="-26"
          rx="8"
          ry="16"
          fill="#f9eae7"
          opacity="0.7"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="11" fill="#D4A843" />
    </g>
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await login(email, password);
    if (result.success) navigate("/admin/dashboard");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-cin-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo + nombre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <MargaritaFlower />
          </div>
          <h1 className="font-display text-2xl text-cin-100">margarita</h1>
          <p className="text-cin-500 text-xs mt-1 uppercase tracking-widest">
            Panel de administración
          </p>
        </div>

        {/* Card */}
        <div className="bg-cin-900 rounded-2xl border border-cin-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                Email
              </label>
              <div className="relative">
                <FaEnvelope
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-600"
                  size={13}
                />
                <input
                  type="email"
                  required
                  placeholder="admin@margarita.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-cin-800 border border-cin-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cin-500 text-cin-100 placeholder-cin-600 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                Contraseña
              </label>
              <div className="relative">
                <FaLock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-600"
                  size={13}
                />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-cin-800 border border-cin-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cin-500 text-cin-100 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cin-600 hover:bg-cin-500 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Ingresar al panel"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-cin-700 text-xs mt-6">
          &copy; {new Date().getFullYear()} Margarita Accesorios
        </p>
      </div>
    </div>
  );
};

export default Login;
