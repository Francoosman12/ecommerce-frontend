import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaBoxOpen,
  FaPercentage,
  FaTags,
  FaSignOutAlt,
  FaHome,
  FaTimes,
  FaClipboardList,
  FaStore,
  FaChartLine,
} from "react-icons/fa";

const MargaritaFlower = () => (
  <svg width="32" height="32" viewBox="0 0 100 100">
    <g transform="translate(50,50)">
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy="-26"
          rx="8"
          ry="16"
          fill="#f9eae7"
          opacity="0.8"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="11" fill="#D4A843" />
    </g>
  </svg>
);

const AdminSidebar = ({ onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
      isActive
        ? "bg-cin-700 text-white font-medium shadow-sm"
        : "text-cin-400 hover:bg-cin-800 hover:text-cin-100"
    }`;

  return (
    <aside className="bg-cin-950 h-full flex flex-col justify-between overflow-y-auto">
      <div className="md:hidden absolute top-4 right-4">
        <button
          onClick={onClose}
          className="p-2 text-cin-500 hover:text-cin-200"
        >
          <FaTimes size={20} />
        </button>
      </div>
      <div>
        <div className="p-6 pb-4 flex items-center gap-3 border-b border-cin-900">
          <MargaritaFlower />
          <div>
            <h2 className="font-display text-lg text-cin-100 tracking-tight">
              margarita
            </h2>
            <p className="text-xs text-cin-600 uppercase tracking-widest">
              Admin
            </p>
          </div>
        </div>
        <nav className="px-3 py-4 space-y-1">
          <NavLink
            to="/admin/dashboard"
            className={navLinkClass}
            end
            onClick={handleLinkClick}
          >
            <FaBoxOpen size={15} /> Productos
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={navLinkClass}
            onClick={handleLinkClick}
          >
            <FaClipboardList size={15} /> Pedidos
          </NavLink>
          <NavLink
            to="/admin/financial"
            className={navLinkClass}
            onClick={handleLinkClick}
          >
            <FaPercentage size={15} /> Tasas y Precios
          </NavLink>
          <NavLink
            to="/admin/categories"
            className={navLinkClass}
            onClick={handleLinkClick}
          >
            <FaTags size={15} /> Categorías
          </NavLink>
          <NavLink
            to="/admin/store"
            className={navLinkClass}
            onClick={handleLinkClick}
          >
            <FaStore size={15} /> Tienda
          </NavLink>
          <NavLink
            to="/admin/sales"
            className={navLinkClass}
            onClick={handleLinkClick}
          >
            <FaChartLine size={15} /> Ventas
          </NavLink>
        </nav>
      </div>
      <div className="p-3 border-t border-cin-900 space-y-1 pb-6">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-cin-500 hover:text-cin-200 text-sm rounded-xl hover:bg-cin-900 transition-colors"
          onClick={handleLinkClick}
        >
          <FaHome size={14} /> Ver tienda
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-cin-900 rounded-xl transition-colors text-sm font-medium"
        >
          <FaSignOutAlt size={14} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
