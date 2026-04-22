import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { trackPurchase } from "../../hooks/useAnalytics";
import Navbar from "../../components/layout/Navbar";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaWhatsapp,
  FaHome,
  FaClipboardList,
} from "react-icons/fa";
import { formatPrice } from "../../utils/formatPrice";

// ─── Componente reutilizable de estado ────────────────────────────────────
const OrderStatus = ({ type }) => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axiosClient.get(`/payments/status/${id}`);
        setOrder(data);
        if (type === "success") trackPurchase(data);
      } catch {
        /* silencioso */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const configs = {
    success: {
      icon: <FaCheckCircle className="text-green-500" size={64} />,
      title: "¡Pedido confirmado!",
      subtitle: "Recibimos tu pedido correctamente.",
      color: "green",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    failure: {
      icon: <FaTimesCircle className="text-red-500" size={64} />,
      title: "El pago no se procesó",
      subtitle: "Hubo un problema con el pago. Podés intentarlo nuevamente.",
      color: "red",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    pending: {
      icon: <FaClock className="text-yellow-500" size={64} />,
      title: "Pago pendiente",
      subtitle: "Tu pago está siendo procesado. Te avisaremos por email.",
      color: "yellow",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
    },
  };

  const cfg = configs[type];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          {/* Ícono */}
          <div className="flex justify-center mb-6">{cfg.icon}</div>

          {/* Título */}
          <h1 className="text-3xl font-black text-gray-800 mb-2">
            {cfg.title}
          </h1>
          <p className="text-gray-500 mb-6">{cfg.subtitle}</p>

          {/* Info de la orden */}
          {order && (
            <div
              className={`${cfg.bg} ${cfg.border} border rounded-2xl p-6 mb-6 text-left space-y-3`}
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Número de pedido</span>
                <span className="font-bold text-gray-800">
                  #{id.slice(-6).toUpperCase()}
                </span>
              </div>
              {order.totalAmount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-gray-800">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              )}
              {order.delivery && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Entrega</span>
                  <span className="font-bold text-gray-800 capitalize">
                    {order.delivery === "retiro"
                      ? "Retiro en local"
                      : "Envío a domicilio"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Nota */}
          {type === "success" && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
              <FaWhatsapp
                className="text-green-500 shrink-0 mt-0.5"
                size={18}
              />
              <p className="text-sm text-green-700">
                Nos comunicaremos por WhatsApp para coordinar los detalles de tu
                pedido.
              </p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FaHome size={16} /> Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Exportamos las 3 variantes ───────────────────────────────────────────
export const OrderSuccess = () => <OrderStatus type="success" />;
export const OrderFailure = () => <OrderStatus type="failure" />;
export const OrderPending = () => <OrderStatus type="pending" />;
