import React from "react";
import {
  FaWhatsapp,
  FaMapMarkerAlt,
  FaInstagram,
  FaClock,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const MargaritaLogo = () => (
  <svg width="42" height="42" viewBox="0 0 100 100">
    <g transform="translate(50,50)">
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy="-28"
          rx="9"
          ry="18"
          fill="#f9eae7"
          opacity="0.8"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="12" fill="#D4A843" />
    </g>
  </svg>
);

const Footer = () => {
  const { isAuthenticated, isCustomer } = useAuth();
  return (
    <footer className="bg-cin-950 text-cin-200 pt-14 pb-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10 border-b border-cin-900 pb-10">
          {/* BRANDING */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MargaritaLogo />
              <span className="font-display text-2xl text-cin-100 tracking-tight">
                margarita
              </span>
            </div>
            <p className="text-cin-400 text-sm leading-relaxed">
              Bufandones artesanales y accesorios de moda femenina. Diseños
              únicos, materiales seleccionados y el calor que necesitás.
            </p>
            {/* Instagram */}
            <a
              href="https://www.instagram.com/margarita_accesorios.11"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-cin-400 hover:text-cin-200 transition-colors text-sm"
            >
              <FaInstagram size={16} />
              @margarita_accesorios.11
            </a>
          </div>

          {/* LINKS RÁPIDOS */}
          <div>
            <h4 className="font-display text-cin-100 text-lg mb-4">
              La tienda
            </h4>
            <ul className="space-y-2 text-sm text-cin-400">
              <li>
                <Link to="/" className="hover:text-cin-200 transition-colors">
                  Catálogo completo
                </Link>
              </li>
              <li>
                <Link
                  to="/nosotros"
                  className="hover:text-cin-200 transition-colors"
                >
                  Quiénes somos
                </Link>
              </li>
              {isAuthenticated && isCustomer && (
                <li>
                  <Link
                    to="/mis-pedidos"
                    className="hover:text-cin-200 transition-colors"
                  >
                    Mis pedidos
                  </Link>
                </li>
              )}
              {!isAuthenticated && (
                <li>
                  <Link
                    to="/login"
                    className="hover:text-cin-200 transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* CONTACTO */}
          <div>
            <h4 className="font-display text-cin-100 text-lg mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-cin-400 text-sm">
                <FaClock className="mt-0.5 text-cin-600 shrink-0" size={14} />
                Lunes a Sábado de 9:00 a 18:00
              </li>
              <li className="flex items-start gap-3 text-cin-400 text-sm">
                <FaMapMarkerAlt
                  className="mt-0.5 text-cin-600 shrink-0"
                  size={14}
                />
                San Miguel de Tucumán, Argentina
              </li>
              <li className="flex items-center gap-3 text-cin-400">
                <FaWhatsapp className="text-green-400 shrink-0" size={16} />
                <a
                  href="https://wa.me/5493815225633"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-green-400 transition-colors font-medium"
                >
                  Consultar por WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="text-center text-cin-700 text-xs flex flex-col md:flex-row justify-between items-center gap-2">
          <p>
            &copy; {new Date().getFullYear()} Margarita Accesorios. Todos los
            derechos reservados.
          </p>
          <p>
            Desarrollado con 🌼 por{" "}
            <a
              href="https://portfolio-francoosman.vercel.app/"
              className="hover:text-cin-400 transition-colors"
            >
              Devos
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
