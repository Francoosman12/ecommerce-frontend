import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import {
  FaShoppingBag,
  FaSearch,
  FaTachometerAlt,
  FaTimes,
  FaSpinner,
  FaChevronRight,
  FaUser,
  FaSignOutAlt,
  FaClipboardList,
  FaChevronDown,
  FaUserLock,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";
import { formatPrice } from "../../utils/formatPrice";

const MargaritaLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <g transform="translate(50,50)">
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy="-28"
          rx="9"
          ry="18"
          fill="#f9eae7"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="12" fill="#D4A843" />
    </g>
  </svg>
);

const Navbar = () => {
  const navigate = useNavigate();
  const { setIsCartOpen, cartItems } = useCart();
  const { isAuthenticated, isAdmin, isCustomer, user, logout } = useAuth();
  const { setSearchTerm } = useSearch();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

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
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setIsOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleShowAll = () => {
    setSearchTerm(query);
    setIsOpen(false);
    setSearchOpen(false);
    navigate("/");
  };
  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };
  const itemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <>
      <div className="bg-cin-900 text-cin-100 text-center py-2 text-xs tracking-widest uppercase">
        Envíos a toda Argentina · Nueva colección disponible
      </div>

      <nav className="bg-cin-50 border-b border-cin-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            onClick={() => {
              setSearchTerm("");
              setQuery("");
            }}
          >
            <MargaritaLogo size={38} />
            <span className="font-display text-xl text-cin-800 tracking-tight hidden sm:block">
              Margarita
            </span>
          </Link>

          <div
            ref={searchRef}
            className="hidden md:flex flex-1 max-w-lg relative"
          >
            <div className="relative w-full">
              <FaSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-400"
                size={13}
              />
              <input
                type="text"
                placeholder="Buscar bufandones, accesorios..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleShowAll()}
                onFocus={() => {
                  if (query && suggestions.length > 0) setIsOpen(true);
                }}
                className={`w-full pl-9 pr-9 py-2.5 bg-white border text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-cin-300 focus:border-cin-400 transition-all ${isOpen ? "rounded-b-none border-cin-400" : "border-cin-200"}`}
              />
              {loading ? (
                <FaSpinner
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cin-400 animate-spin"
                  size={13}
                />
              ) : query ? (
                <FaTimes
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cin-300 cursor-pointer hover:text-cin-600"
                  size={13}
                  onClick={() => {
                    setQuery("");
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                />
              ) : null}
            </div>

            {isOpen && (
              <div className="absolute top-full left-0 w-full bg-white border border-t-0 border-cin-300 rounded-b-xl shadow-lg z-50 overflow-hidden">
                {suggestions.length > 0 ? (
                  <ul className="divide-y divide-cin-100">
                    {suggestions.map((prod) => {
                      const thumb =
                        prod.images?.[0]?.url?.replace(
                          "/upload/",
                          "/upload/f_auto,q_auto,w_100,h_100,c_fill/",
                        ) || "";
                      return (
                        <li key={prod._id}>
                          <Link
                            to={`/product/${prod._id}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-3 hover:bg-cin-50 transition-colors group"
                          >
                            <div className="h-10 w-10 rounded-lg border border-cin-200 overflow-hidden shrink-0 bg-cin-100">
                              {thumb && (
                                <img
                                  src={thumb}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-cin-800 group-hover:text-cin-600 line-clamp-1">
                                {prod.name}
                              </p>
                              <p className="text-xs text-cin-400">
                                {prod.category?.name} ·{" "}
                                <span className="font-medium text-cin-600">
                                  {formatPrice(prod.prices?.cash)}
                                </span>
                              </p>
                            </div>
                            <FaChevronRight
                              className="text-cin-300 shrink-0"
                              size={10}
                            />
                          </Link>
                        </li>
                      );
                    })}
                    <li className="p-2 bg-cin-50 text-center">
                      <button
                        onClick={handleShowAll}
                        className="text-sm font-medium text-cin-600 hover:text-cin-800 w-full py-1.5"
                      >
                        Ver todos los resultados →
                      </button>
                    </li>
                  </ul>
                ) : (
                  <div className="p-4 text-center text-cin-400 text-sm">
                    Sin resultados para "{query}"
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-cin-600 hover:text-cin-800 p-1"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <FaSearch size={18} />
            </button>

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="text-cin-600 hover:text-cin-800 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <FaTachometerAlt size={18} />
                <span className="hidden lg:inline">Panel</span>
              </Link>
            )}

            {isCustomer && (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 text-cin-600 hover:text-cin-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-cin-200 rounded-full flex items-center justify-center">
                    <FaUser size={12} className="text-cin-700" />
                  </div>
                  <FaChevronDown
                    size={10}
                    className={`transition-transform text-cin-400 ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-cin-200 overflow-hidden z-50">
                    <div className="px-4 py-3 bg-cin-50 border-b border-cin-100">
                      <p className="text-xs font-medium text-cin-800">
                        {user?.name}
                      </p>
                      <p className="text-xs text-cin-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/mis-pedidos"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-cin-700 hover:bg-cin-50 transition-colors"
                    >
                      <FaClipboardList size={13} /> Mis pedidos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt size={13} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <Link
                to="/login"
                className="text-cin-400 hover:text-cin-700 transition-colors"
                title="Iniciar sesión"
              >
                <FaUserLock size={18} />
              </Link>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-cin-600 hover:text-cin-800 transition-colors p-1"
            >
              <FaShoppingBag size={22} />
              {itemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-cin-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-cin-50">
                  {itemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="md:hidden border-t border-cin-200 px-4 py-3 bg-cin-50">
            <div className="relative">
              <FaSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-400"
                size={13}
              />
              <input
                autoFocus
                type="text"
                placeholder="Buscar productos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleShowAll()}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-cin-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cin-300"
              />
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
