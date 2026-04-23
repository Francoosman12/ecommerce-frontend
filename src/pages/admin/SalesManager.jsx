import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axiosClient from "../../api/axiosClient";
import { formatPrice } from "../../utils/formatPrice";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaReceipt,
  FaPlus,
  FaSpinner,
  FaSearch,
  FaFileDownload,
  FaWhatsapp,
  FaGlobe,
  FaStore,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";

const TYPE_BADGE = {
  web: "bg-blue-50 text-blue-700 border-blue-100",
  manual: "bg-green-50 text-green-700 border-green-100",
};

const PAYMENT_LABELS = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  mercadopago: "Mercado Pago",
  otro: "Otro",
};

const CHANNEL_ICONS = {
  web: <FaGlobe size={11} />,
  instagram: "📸",
  whatsapp: <FaWhatsapp size={11} />,
  local: <FaStore size={11} />,
};

const SalesManager = () => {
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [filters, setFilters] = useState({
    type: "",
    from: "",
    to: "",
  });

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filters.type) params.set("type", filters.type);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      const { data } = await axiosClient.get(`/sales/all?${params}`);
      setSales(data.sales);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleReceipt = async (sale) => {
    try {
      const endpoint =
        sale._type === "web"
          ? `/sales/receipt/order/${sale._id}`
          : `/sales/receipt/manual/${sale._id}`;
      const { data } = await axiosClient.get(endpoint);
      const win = window.open("", "_blank");
      win.document.write(data);
      win.document.close();
    } catch {
      toast.error("Error al generar el comprobante");
    }
  };

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const inputClass =
    "border border-cin-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cin-300 bg-white text-cin-700";

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-cin-800 flex items-center gap-3">
              <FaReceipt className="text-cin-600" size={18} /> Historial de
              ventas
            </h1>
            <p className="text-cin-400 text-sm mt-1">{total} ventas en total</p>
          </div>
          <Link
            to="/admin/sales/new"
            className="bg-cin-700 hover:bg-cin-800 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium text-sm transition-colors shadow-sm"
          >
            <FaPlus size={12} /> Registrar venta
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-cin-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-cin-400 mb-1">Tipo</label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((f) => ({ ...f, type: e.target.value }))
              }
              className={inputClass}
            >
              <option value="">Todos</option>
              <option value="web">Solo web</option>
              <option value="manual">Solo directas</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-cin-400 mb-1">Desde</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) =>
                setFilters((f) => ({ ...f, from: e.target.value }))
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-cin-400 mb-1">Hasta</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) =>
                setFilters((f) => ({ ...f, to: e.target.value }))
              }
              className={inputClass}
            />
          </div>
          <button
            onClick={() => setFilters({ type: "", from: "", to: "" })}
            className="text-cin-400 hover:text-cin-600 text-sm px-3 py-2 transition-colors"
          >
            Limpiar
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-cin-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-16">
              <FaSpinner className="animate-spin text-cin-500 text-xl" />
            </div>
          ) : sales.length === 0 ? (
            <div className="p-12 text-center text-cin-400 text-sm italic">
              No hay ventas con esos filtros.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                  <thead className="bg-cin-50 text-cin-500 text-xs uppercase tracking-wider border-b border-cin-100">
                    <tr>
                      <th className="p-4 text-left">Fecha</th>
                      <th className="p-4 text-left">Cliente</th>
                      <th className="p-4 text-left">Canal</th>
                      <th className="p-4 text-left">Pago</th>
                      <th className="p-4 text-right">Total</th>
                      <th className="p-4 text-center">Tipo</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cin-100">
                    {sales.map((sale) => {
                      const name =
                        sale._type === "web"
                          ? sale.customerInfo?.name
                          : sale.customerName;
                      const channel =
                        sale._type === "web" ? "web" : sale.channel;

                      return (
                        <tr
                          key={`${sale._type}-${sale._id}`}
                          className="hover:bg-cin-50/50 transition-colors"
                        >
                          <td className="p-4">
                            <p className="text-sm text-cin-700 font-medium">
                              {fmtDate(sale.createdAt)}
                            </p>
                            <p className="text-xs text-cin-400 font-mono">
                              #{sale._id.slice(-6).toUpperCase()}
                            </p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-cin-700">
                              {name || "Sin nombre"}
                            </p>
                            <p className="text-xs text-cin-400">
                              {sale.customerPhone ||
                                sale.customerInfo?.phone ||
                                ""}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className="flex items-center gap-1.5 text-xs text-cin-600 capitalize">
                              {CHANNEL_ICONS[channel]} {channel}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs text-cin-600 capitalize">
                              {PAYMENT_LABELS[sale.paymentMethod] ||
                                sale.paymentMethod}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="font-display font-semibold text-cin-700">
                              {formatPrice(sale.totalAmount)}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TYPE_BADGE[sale._type]}`}
                            >
                              {sale._type === "web" ? "Web" : "Directa"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleReceipt(sale)}
                              title="Ver comprobante"
                              className="text-cin-400 hover:text-cin-700 transition-colors p-1"
                            >
                              <FaFileDownload size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {pages > 1 && (
                <div className="bg-cin-50 border-t border-cin-100 px-4 py-3 flex items-center justify-between">
                  <p className="text-xs text-cin-400">
                    Página {page} de {pages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-2 border border-cin-200 rounded-lg hover:bg-white disabled:opacity-40 text-cin-600"
                    >
                      <FaAngleLeft size={12} />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, pages))}
                      disabled={page === pages}
                      className="p-2 border border-cin-200 rounded-lg hover:bg-white disabled:opacity-40 text-cin-600"
                    >
                      <FaAngleRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SalesManager;
