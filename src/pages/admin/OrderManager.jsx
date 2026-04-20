import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axiosClient from "../../api/axiosClient";
import { formatPrice } from "../../utils/formatPrice";
import { toast } from "react-toastify";
import {
  FaClipboardList,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaWhatsapp,
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaFilter,
} from "react-icons/fa";

// ─── Config de estados ────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pendiente: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <FaClock size={12} />,
  },
  pagado: {
    label: "Pagado",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <FaCheckCircle size={12} />,
  },
  preparando: {
    label: "Preparando",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: <FaBox size={12} />,
  },
  listo: {
    label: "Listo",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    icon: <FaCheckCircle size={12} />,
  },
  enviado: {
    label: "Enviado",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: <FaTruck size={12} />,
  },
  entregado: {
    label: "Entregado",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <FaCheckCircle size={12} />,
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: <FaTimesCircle size={12} />,
  },
};

const PAYMENT_LABELS = {
  mercadopago: "Mercado Pago",
  efectivo: "Efectivo",
  transferencia: "Transferencia",
};

const DELIVERY_LABELS = {
  retiro: "Retiro en local",
  envio: "Envío a domicilio",
};

// ─── Badge de estado ──────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pendiente;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ─── Fila de orden expandible ─────────────────────────────────────────────
const OrderRow = ({ order, onStatusChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.adminNotes || "");
  const [saving, setSaving] = useState(false);

  const shortId = order._id.slice(-6).toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosClient.put(`/orders/${order._id}/status`, {
        status: newStatus,
        adminNotes: notes,
      });
      toast.success(`Pedido #${shortId} actualizado`);
      onStatusChange();
    } catch {
      toast.error("Error al actualizar el pedido");
    } finally {
      setSaving(false);
    }
  };

  const handleWhatsApp = () => {
    const phone = order.customerInfo.phone.replace(/\D/g, "");
    const fullPhone = phone.startsWith("54") ? phone : `549${phone}`;
    const msg = `Hola ${order.customerInfo.name}! Te escribimos de la tienda sobre tu pedido #${shortId}. `;
    window.open(
      `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
      {/* Fila principal (siempre visible) */}
      <div
        className="p-4 flex flex-wrap items-center gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* ID */}
        <div className="w-20 shrink-0">
          <p className="text-xs text-gray-400 font-mono">#{shortId}</p>
          <p className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleDateString("es-AR")}
          </p>
        </div>

        {/* Cliente */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm truncate">
            {order.customerInfo.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {order.customerInfo.email}
          </p>
        </div>

        {/* Entrega */}
        <div className="hidden md:block w-32 shrink-0">
          <p className="text-xs text-gray-600 font-medium">
            {DELIVERY_LABELS[order.deliveryMethod]}
          </p>
          <p className="text-xs text-gray-400">
            {PAYMENT_LABELS[order.paymentMethod]}
          </p>
        </div>

        {/* Total */}
        <div className="w-24 shrink-0 text-right">
          <p className="font-black text-gray-800">
            {formatPrice(order.totalAmount)}
          </p>
        </div>

        {/* Estado */}
        <div className="shrink-0">
          <StatusBadge status={order.status} />
        </div>

        {/* Toggle */}
        <div className="text-gray-400 shrink-0">
          {expanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
        </div>
      </div>

      {/* Detalle expandido */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Izquierda: Productos + Entrega */}
            <div className="space-y-4">
              {/* Productos */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Productos
                </h4>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-gray-100"
                    >
                      <div>
                        <p className="font-medium text-gray-700">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          SKU: {item.sku} • x{item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-gray-700">
                        {formatPrice(item.priceUnit * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Entrega */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Entrega
                </h4>
                <div className="bg-white p-3 rounded-lg border border-gray-100 text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Método:</strong>{" "}
                    {DELIVERY_LABELS[order.deliveryMethod]}
                  </p>
                  {order.deliveryMethod === "envio" &&
                    order.shippingAddress?.street && (
                      <>
                        <p>
                          <strong>Dirección:</strong>{" "}
                          {order.shippingAddress.street}
                        </p>
                        <p>
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.province}
                        </p>
                        {order.shippingAddress.notes && (
                          <p>
                            <strong>Indicaciones:</strong>{" "}
                            {order.shippingAddress.notes}
                          </p>
                        )}
                      </>
                    )}
                  <p>
                    <strong>Pago:</strong> {PAYMENT_LABELS[order.paymentMethod]}
                  </p>
                  {order.mpStatus && (
                    <p>
                      <strong>Estado MP:</strong> {order.mpStatus}
                    </p>
                  )}
                </div>
              </div>

              {/* Contacto */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Contacto
                </h4>
                <div className="bg-white p-3 rounded-lg border border-gray-100 text-sm text-gray-600 space-y-1 flex justify-between items-start">
                  <div>
                    <p>{order.customerInfo.name}</p>
                    <p>{order.customerInfo.email}</p>
                    <p>{order.customerInfo.phone}</p>
                  </div>
                  <button
                    onClick={handleWhatsApp}
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                  >
                    <FaWhatsapp size={14} /> WA
                  </button>
                </div>
              </div>
            </div>

            {/* Derecha: Gestión de estado */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Actualizar estado
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setNewStatus(key)}
                      className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                        newStatus === key
                          ? cfg.color + " border-2"
                          : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas internas */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Notas internas
                </h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas solo visibles para el admin..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
                />
              </div>

              {/* Guardar */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Guardar cambios"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Página principal OrderManager ───────────────────────────────────────
const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
  });

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filterStatus) params.append("status", filterStatus);

      const { data } = await axiosClient.get(`/orders?${params}`);
      setOrders(data.orders);
      setPagination({
        total: data.total,
        pages: data.pages,
        currentPage: data.currentPage,
      });
    } catch {
      toast.error("Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  // Filtro local por nombre/email/id
  const filteredOrders = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.customerInfo.name.toLowerCase().includes(q) ||
      o.customerInfo.email.toLowerCase().includes(q) ||
      o._id.slice(-6).toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaClipboardList className="text-indigo-600" /> Pedidos
          </h1>
          <p className="text-gray-500 mt-1">
            Gestioná los pedidos de la tienda.
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
          {/* Buscador */}
          <div className="relative flex-1 min-w-48">
            <FaSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, email o #ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>

          {/* Filtro por estado */}
          <div className="flex items-center gap-2 flex-wrap">
            <FaFilter className="text-gray-400" size={14} />
            <button
              onClick={() => setFilterStatus("")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${!filterStatus ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Todos ({pagination.total})
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${filterStatus === key ? cfg.color : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de órdenes */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FaClipboardList size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">
              No hay pedidos
              {filterStatus
                ? ` con estado "${STATUS_CONFIG[filterStatus]?.label}"`
                : ""}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                onStatusChange={fetchOrders}
              />
            ))}
          </div>
        )}

        {/* Paginación */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => fetchOrders(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${pagination.currentPage == page ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"}`}
                >
                  {page}
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderManager;
