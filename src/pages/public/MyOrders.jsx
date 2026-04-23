import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";
import { formatPrice } from "../../utils/formatPrice";
import useSEO from "../../hooks/useSEO";
import {
  FaArrowLeft,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaStore,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaBox,
  FaSpinner,
} from "react-icons/fa";

const STATUS_CONFIG = {
  pendiente: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <FaClock size={11} />,
  },
  pagado: {
    label: "Pagado",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <FaCheckCircle size={11} />,
  },
  preparando: {
    label: "Preparando",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: <FaBox size={11} />,
  },
  listo: {
    label: "Listo",
    color: "bg-cin-100 text-cin-700 border-cin-200",
    icon: <FaCheckCircle size={11} />,
  },
  enviado: {
    label: "Enviado",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: <FaTruck size={11} />,
  },
  entregado: {
    label: "Entregado",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <FaCheckCircle size={11} />,
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-red-100 text-red-600 border-red-200",
    icon: <FaTimesCircle size={11} />,
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pendiente;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
};

const MyOrders = () => {
  const { isAuthenticated, isCustomer, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useSEO({ title: "Mis pedidos — Margarita Accesorios" });

  // Redirigir si no está logueada
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { state: { from: "/mis-pedidos" } });
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetch = async () => {
      try {
        const { data } = await axiosClient.get("/orders/my-orders");
        setOrders(data);
      } catch {
        /* silencioso */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isAuthenticated]);

  if (authLoading || loading)
    return (
      <div className="min-h-screen bg-cin-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <FaSpinner className="animate-spin text-cin-500 text-2xl" />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-cin-50 flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1 max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-cin-500 hover:text-cin-700 mb-6 text-sm font-medium transition-colors"
        >
          <FaArrowLeft size={11} /> Volver a la tienda
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <FaShoppingBag className="text-cin-600" size={20} />
          <h1 className="font-display text-2xl text-cin-800">Mis pedidos</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-cin-200 p-12 text-center">
            <div className="w-16 h-16 bg-cin-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShoppingBag className="text-cin-300" size={24} />
            </div>
            <h2 className="font-display text-lg text-cin-700 mb-2">
              Todavía no hiciste ningún pedido
            </h2>
            <p className="text-cin-400 text-sm mb-6">
              Explorá nuestro catálogo y encontrá algo que te guste.
            </p>
            <Link
              to="/"
              className="bg-cin-700 hover:bg-cin-800 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm inline-block"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const shortId = order._id.slice(-6).toUpperCase();
              const isOpen = expanded === order._id;
              const dateStr = new Date(order.createdAt).toLocaleDateString(
                "es-AR",
                { day: "2-digit", month: "long", year: "numeric" },
              );

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-cin-200 overflow-hidden"
                >
                  {/* Fila resumen */}
                  <button
                    className="w-full p-5 flex flex-wrap items-center gap-4 text-left hover:bg-cin-50 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : order._id)}
                  >
                    <div className="shrink-0">
                      <p className="text-xs text-cin-400 font-mono">
                        #{shortId}
                      </p>
                      <p className="text-xs text-cin-400 mt-0.5">{dateStr}</p>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-cin-700 line-clamp-1">
                        {order.items.map((i) => i.name).join(", ")}
                      </p>
                      <p className="text-xs text-cin-400 mt-0.5">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "producto" : "productos"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-display font-semibold text-cin-700">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                  </button>

                  {/* Detalle expandido */}
                  {isOpen && (
                    <div className="border-t border-cin-100 p-5 bg-cin-50/50 space-y-4">
                      {/* Productos */}
                      <div>
                        <h4 className="text-xs font-medium text-cin-500 uppercase tracking-wide mb-3">
                          Productos
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 bg-white p-3 rounded-xl border border-cin-100"
                            >
                              <div className="w-10 h-10 rounded-lg bg-cin-100 shrink-0 overflow-hidden">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-cin-700 line-clamp-1">
                                  {item.name}
                                </p>
                                <p className="text-xs text-cin-400">
                                  x{item.quantity}
                                </p>
                              </div>
                              <span className="text-sm font-medium text-cin-600 shrink-0">
                                {formatPrice(item.priceUnit * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Info entrega y pago */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white p-4 rounded-xl border border-cin-100">
                          <h4 className="text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                            Entrega
                          </h4>
                          <div className="flex items-start gap-2 text-sm text-cin-600">
                            {order.deliveryMethod === "retiro" ? (
                              <>
                                <FaStore
                                  className="mt-0.5 text-cin-400 shrink-0"
                                  size={13}
                                />{" "}
                                Retiro en local
                              </>
                            ) : (
                              <>
                                <FaMapMarkerAlt
                                  className="mt-0.5 text-cin-400 shrink-0"
                                  size={13}
                                />
                                <span>
                                  {order.shippingAddress?.street},{" "}
                                  {order.shippingAddress?.city}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-cin-100">
                          <h4 className="text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                            Total pagado
                          </h4>
                          <p className="font-display font-semibold text-cin-700 text-lg">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <p className="text-xs text-cin-400 capitalize mt-0.5">
                            {order.paymentMethod}
                          </p>
                        </div>
                      </div>

                      {/* Nota si está pendiente */}
                      {order.status === "pendiente" && (
                        <p className="text-xs text-cin-500 bg-cin-100 rounded-xl p-3 text-center">
                          Tu pedido está siendo procesado. Nos comunicaremos a
                          la brevedad.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyOrders;
