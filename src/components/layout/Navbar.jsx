import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import {
  FaShoppingCart,
  FaUserLock,
  FaSearch,
  FaTachometerAlt,
  FaTimes,
  FaSpinner,
  FaChevronRight,
  FaUser,
  FaSignOutAlt,
  FaClipboardList,
  FaChevronDown,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";
import { formatPrice } from "../../utils/formatPrice";
import logo from "../../../public/casabahiamini.png";

const Navbar = () => {
  const navigate = useNavigate();
  const { setIsCartOpen, cartItems } = useCart();
  const { isAuthenticated, isAdmin, isCustomer, user, logout } = useAuth();
  const { setSearchTerm } = useSearch();

  // Buscador
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchContainerRef = useRef(null);

  // Menú usuario
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Buscador predictivo
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get("/products");
        const filtered = data.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.sku?.toLowerCase().includes(query.toLowerCase()) ||
            p.category?.name?.toLowerCase().includes(query.toLowerCase()),
        );
        setSuggestions(filtered.slice(0, 5));
        setIsOpen(true);
      } catch {
        /* silencioso */
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  // Cerrar al clickear fuera
  useEffect(() => {
    const handler = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      )
        setIsOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleShowAllResults = () => {
    setSearchTerm(query);
    setIsOpen(false);
    navigate("/");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleShowAllResults();
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const itemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center shrink-0"
          onClick={() => {
            setSearchTerm("");
            setQuery("");
          }}
        >
          <img
            src={logo}
            alt="Logo"
            className="h-10 md:h-12 w-auto object-contain"
          />
        </Link>

        {/* BUSCADOR */}
        <div
          ref={searchContainerRef}
          className="hidden md:flex flex-1 max-w-xl relative"
        >
          <div className="relative w-full">
            <input
              type="text"
              placeholder="¿Qué estás buscando? (Sillones, Mesas...)"
              className={`w-full pl-4 pr-10 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-gray-50 transition-all text-sm ${isOpen ? "rounded-b-none border-indigo-400 ring-2 ring-indigo-100" : "border-gray-200"}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (query && suggestions.length > 0) setIsOpen(true);
              }}
            />
            {loading ? (
              <FaSpinner className="absolute right-3 top-3 text-indigo-500 animate-spin" />
            ) : query ? (
              <FaTimes
                className="absolute right-3 top-3 text-gray-400 cursor-pointer hover:text-red-500"
                onClick={() => {
                  setQuery("");
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              />
            ) : (
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            )}
          </div>

          {isOpen && (
            <div className="absolute top-full left-0 w-full bg-white border border-t-0 border-indigo-200 rounded-b-xl shadow-xl z-50 overflow-hidden">
              {suggestions.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {suggestions.map((prod) => {
                    const thumb =
                      prod.images?.[0]?.url?.replace(
                        "/upload/",
                        "/upload/f_auto,q_auto,w_100,h_100,c_fill/",
                      ) || "https://via.placeholder.com/50";
                    return (
                      <li key={prod._id}>
                        <Link
                          to={`/product/${prod._id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="h-12 w-12 rounded border border-gray-200 overflow-hidden shrink-0">
                            <img
                              src={thumb}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 line-clamp-1">
                              {prod.name}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {prod.category?.name} •{" "}
                              <span className="font-medium text-green-600">
                                {formatPrice(prod.prices.cash)}
                              </span>
                            </p>
                          </div>
                          <FaChevronRight className="text-gray-300 text-xs" />
                        </Link>
                      </li>
                    );
                  })}
                  <li className="p-2 bg-gray-50 text-center">
                    <button
                      onClick={handleShowAllResults}
                      className="text-sm font-bold text-indigo-600 hover:text-indigo-800 w-full py-2 flex items-center justify-center gap-2"
                    >
                      Ver todos los resultados para "{query}"{" "}
                      <FaChevronRight size={10} />
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No encontramos productos con ese nombre.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ICONOS DERECHA */}
        <div className="flex items-center gap-4">
          {/* Admin → panel */}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 font-medium text-sm"
              title="Panel Admin"
            >
              <FaTachometerAlt size={20} />
              <span className="hidden lg:inline">Panel</span>
            </Link>
          )}

          {/* Cliente logueado → menú desplegable */}
          {isCustomer && (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FaUser size={14} className="text-indigo-600" />
                </div>
                <span className="hidden lg:inline text-sm font-medium">
                  {user?.name?.split(" ")[0]}
                </span>
                <FaChevronDown
                  size={10}
                  className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-700">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/mis-pedidos"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                  >
                    <FaClipboardList size={14} /> Mis pedidos
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <FaSignOutAlt size={14} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}

          {/* No logueado → ícono login */}
          {!isAuthenticated && (
            <Link
              to="/login"
              className="text-gray-400 hover:text-indigo-600 transition-colors"
              title="Iniciar sesión"
            >
              <FaUserLock size={20} />
            </Link>
          )}

          {/* Carrito */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative group text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <FaShoppingCart size={24} />
            {itemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                {itemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
