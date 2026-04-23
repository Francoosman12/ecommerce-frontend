import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axiosClient from "../../api/axiosClient";
import { formatPrice } from "../../utils/formatPrice";
import { Link } from "react-router-dom";
import {
  FaChartLine,
  FaShoppingBag,
  FaReceipt,
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaSpinner,
} from "react-icons/fa";

const MetricCard = ({
  icon,
  label,
  value,
  sub,
  trend,
  color = "bg-cin-600",
}) => (
  <div className="bg-white rounded-2xl border border-cin-200 p-5">
    <div className="flex items-start justify-between mb-3">
      <div
        className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      {trend !== undefined && (
        <span
          className={`text-xs font-medium flex items-center gap-1 px-2 py-0.5 rounded-full ${
            trend >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
          }`}
        >
          {trend >= 0 ? <FaArrowUp size={9} /> : <FaArrowDown size={9} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-xs text-cin-400 font-medium uppercase tracking-wide mb-1">
      {label}
    </p>
    <p className="font-display text-2xl font-semibold text-cin-800">{value}</p>
    {sub && <p className="text-xs text-cin-400 mt-1">{sub}</p>}
  </div>
);

const ChannelBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-cin-600 mb-1">
        <span className="capitalize font-medium">{label}</span>
        <span>
          {count} ventas ({pct}%)
        </span>
      </div>
      <div className="h-2 bg-cin-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const CHANNEL_COLORS = {
  local: "bg-cin-600",
  instagram: "bg-pink-500",
  whatsapp: "bg-green-500",
  web: "bg-blue-500",
  otro: "bg-cin-300",
};

const PAYMENT_LABELS = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  mercadopago: "Mercado Pago",
  otro: "Otro",
};

const SalesDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axiosClient.get("/sales/metrics");
        setMetrics(data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center p-20">
          <FaSpinner className="animate-spin text-cin-500 text-2xl" />
        </div>
      </AdminLayout>
    );

  const totalByChannel = Object.values(metrics?.byChannel || {}).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl text-cin-800 flex items-center gap-3">
              <FaChartLine className="text-cin-600" size={20} /> Ventas
            </h1>
            <p className="text-cin-400 text-sm mt-1">Resumen del mes actual</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/admin/sales/new"
              className="bg-cin-700 hover:bg-cin-800 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium text-sm transition-colors shadow-sm"
            >
              <FaPlus size={12} /> Registrar venta
            </Link>
            <Link
              to="/admin/sales/history"
              className="bg-white border border-cin-200 text-cin-700 hover:bg-cin-50 px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium text-sm transition-colors"
            >
              <FaReceipt size={12} /> Ver historial
            </Link>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={<FaChartLine className="text-white" size={16} />}
            label="Ingresos del mes"
            value={formatPrice(metrics?.revenueThisMonth || 0)}
            trend={metrics?.revenueGrowth}
            sub={`vs ${formatPrice(metrics?.revenueLastMonth || 0)} el mes pasado`}
            color="bg-cin-700"
          />
          <MetricCard
            icon={<FaShoppingBag className="text-white" size={16} />}
            label="Ventas del mes"
            value={metrics?.totalSalesThisMonth || 0}
            sub={`${metrics?.webSalesThisMonth || 0} web · ${metrics?.manualSalesThisMonth || 0} directas`}
            color="bg-cin-600"
          />
          <MetricCard
            icon={<FaReceipt className="text-white" size={16} />}
            label="Ticket promedio"
            value={formatPrice(metrics?.avgTicket || 0)}
            color="bg-gold"
          />
          <MetricCard
            icon={<FaTrophy className="text-white" size={16} />}
            label="Top producto"
            value={
              metrics?.topProducts?.[0]?.name
                ?.split(" ")
                .slice(0, 2)
                .join(" ") || "—"
            }
            sub={
              metrics?.topProducts?.[0]
                ? `${metrics.topProducts[0].qty} unidades`
                : "Sin datos"
            }
            color="bg-cin-800"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Productos más vendidos */}
          <div className="bg-white rounded-2xl border border-cin-200 p-6">
            <h3 className="font-display text-base text-cin-700 mb-4 flex items-center gap-2">
              <FaTrophy className="text-gold" size={14} /> Top productos este
              mes
            </h3>
            {metrics?.topProducts?.length > 0 ? (
              <div className="space-y-3">
                {metrics.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        i === 0
                          ? "bg-gold text-white"
                          : "bg-cin-100 text-cin-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-cin-700 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-cin-400">
                        {p.qty} unidades · {formatPrice(p.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-cin-400 italic text-center py-4">
                Sin ventas este mes
              </p>
            )}
          </div>

          {/* Canal de ventas */}
          <div className="bg-white rounded-2xl border border-cin-200 p-6">
            <h3 className="font-display text-base text-cin-700 mb-4">
              Canal de ventas directas
            </h3>
            {totalByChannel > 0 ? (
              Object.entries(metrics?.byChannel || {}).map(([ch, count]) => (
                <ChannelBar
                  key={ch}
                  label={ch}
                  count={count}
                  total={totalByChannel}
                  color={CHANNEL_COLORS[ch] || "bg-cin-300"}
                />
              ))
            ) : (
              <p className="text-sm text-cin-400 italic text-center py-4">
                Sin ventas directas este mes
              </p>
            )}
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="bg-white rounded-2xl border border-cin-200 p-6">
          <h3 className="font-display text-base text-cin-700 mb-4">
            Métodos de pago
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(metrics?.byPayment || {}).map(([method, count]) => (
              <div
                key={method}
                className="bg-cin-50 rounded-xl p-4 text-center border border-cin-100"
              >
                <p className="font-display text-2xl font-semibold text-cin-700">
                  {count}
                </p>
                <p className="text-xs text-cin-400 mt-1">
                  {PAYMENT_LABELS[method] || method}
                </p>
              </div>
            ))}
            {Object.keys(metrics?.byPayment || {}).length === 0 && (
              <p className="text-sm text-cin-400 italic col-span-4 text-center py-4">
                Sin datos
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SalesDashboard;
