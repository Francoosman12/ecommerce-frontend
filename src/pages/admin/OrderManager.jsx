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
  FaFileDownload,
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

const PAYMENT_LABELS = {
  mercadopago: "Mercado Pago",
  efectivo: "Efectivo",
  transferencia: "Transferencia",
};
const DELIVERY_LABELS = {
  retiro: "Retiro en local",
  envio: "Envío a domicilio",
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
    const msg = `Hola ${order.customerInfo.name}! Te escribimos de Margarita Accesorios sobre tu pedido #${shortId}. `;
    window.open(
      `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  const handleReceipt = async () => {
    try {
      const { data } = await axiosClient.get(
        `/sales/receipt/order/${order._id}`,
      );
      const win = window.open("", "_blank");
      win.document.write(data);
      win.document.close();
    } catch {
      toast.error("Error al generar comprobante");
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border overflow-hidden transition-all ${expanded ? "border-cin-300 shadow-sm" : "border-cin-200 hover:border-cin-300"}`}
    >
      <div
        className="p-4 flex flex-wrap items-center gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-20 shrink-0">
          <p className="text-xs text-cin-400 font-mono">#{shortId}</p>
          <p className="text-xs text-cin-400">
            {new Date(order.createdAt).toLocaleDateString("es-AR")}
          </p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-cin-800 text-sm truncate">
            {order.customerInfo.name}
          </p>
          <p className="text-xs text-cin-400 truncate">
            {order.customerInfo.email}
          </p>
        </div>
        <div className="hidden md:block w-36 shrink-0">
          <p className="text-xs text-cin-600 font-medium">
            {DELIVERY_LABELS[order.deliveryMethod]}
          </p>
          <p className="text-xs text-cin-400">
            {PAYMENT_LABELS[order.paymentMethod]}
          </p>
        </div>
        <div className="w-24 shrink-0 text-right">
          <p className="font-display font-semibold text-cin-800">
            {formatPrice(order.totalAmount)}
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge status={order.status} />
        </div>
        <div className="text-cin-300 shrink-0">
          {expanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-cin-100 p-5 bg-cin-50/50 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                  Productos
                </h4>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm bg-white p-3 rounded-xl border border-cin-100"
                    >
                      <div>
                        <p className="font-medium text-cin-700">{item.name}</p>
                        <p className="text-xs text-cin-400">
                          SKU: {item.sku} · x{item.quantity}
                        </p>
                      </div>
                      <span className="font-display font-semibold text-cin-700">
                        {formatPrice(item.priceUnit * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                  Entrega
                </h4>
                <div className="bg-white p-3 rounded-xl border border-cin-100 text-sm text-cin-600 space-y-1">
                  <p>
                    <span className="font-medium">Método:</span>{" "}
                    {DELIVERY_LABELS[order.deliveryMethod]}
                  </p>
                  {order.deliveryMethod === "envio" &&
                    order.shippingAddress?.street && (
                      <>
                        <p>
                          <span className="font-medium">Dirección:</span>{" "}
                          {order.shippingAddress.street}
                        </p>
                        <p>
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.province}
                        </p>
                        {order.shippingAddress.notes && (
                          <p>
                            <span className="font-medium">Indicaciones:</span>{" "}
                            {order.shippingAddress.notes}
                          </p>
                        )}
                      </>
                    )}
                  <p>
                    <span className="font-medium">Pago:</span>{" "}
                    {PAYMENT_LABELS[order.paymentMethod]}
                  </p>
                  {order.mpStatus && (
                    <p>
                      <span className="font-medium">Estado MP:</span>{" "}
                      {order.mpStatus}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                  Contacto
                </h4>
                <div className="bg-white p-3 rounded-xl border border-cin-100 text-sm text-cin-600 flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="font-medium text-cin-700">
                      {order.customerInfo.name}
                    </p>
                    <p>{order.customerInfo.email}</p>
                    <p>{order.customerInfo.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReceipt}
                      title="Ver comprobante"
                      className="p-2 text-cin-400 hover:text-cin-700 hover:bg-cin-100 rounded-lg transition-colors"
                    >
                      <FaFileDownload size={15} />
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                      <FaWhatsapp size={13} /> WA
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                  Actualizar estado
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setNewStatus(key)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                        newStatus === key
                          ? `${cfg.color} border-2`
                          : "bg-white border-cin-200 text-cin-500 hover:border-cin-300"
                      }`}
                    >
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                  Notas internas
                </h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas solo visibles para el admin..."
                  rows={3}
                  className="w-full border border-cin-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cin-300 bg-white resize-none text-cin-700 placeholder-cin-300"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-cin-700 hover:bg-cin-800 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
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
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl text-cin-800 flex items-center gap-3">
            <FaClipboardList className="text-cin-600" size={18} /> Pedidos
          </h1>
          <p className="text-cin-400 text-sm mt-1">
            Gestioná los pedidos de la tienda.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-cin-200 p-4 mb-5 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <FaSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-300"
              size={13}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, email o #ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-cin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cin-300 bg-cin-50 text-cin-700 placeholder-cin-300"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <FaFilter className="text-cin-300" size={12} />
            <button
              onClick={() => setFilterStatus("")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filterStatus ? "bg-cin-700 text-white" : "bg-cin-50 text-cin-600 hover:bg-cin-100 border border-cin-200"}`}
            >
              Todos ({pagination.total})
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${filterStatus === key ? cfg.color : "bg-white border-cin-200 text-cin-500 hover:border-cin-300"}`}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-cin-600 border-t-transparent" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-cin-300">
            <FaClipboardList size={44} className="mx-auto mb-4 opacity-40" />
            <p className="font-medium text-cin-500 text-sm">
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

        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => fetchOrders(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${pagination.currentPage == page ? "bg-cin-700 text-white" : "bg-white border border-cin-200 text-cin-600 hover:border-cin-400"}`}
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
