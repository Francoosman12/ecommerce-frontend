import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { useProducts } from "../../hooks/useProducts";
import { formatPrice } from "../../utils/formatPrice";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaSearch,
  FaAngleLeft,
  FaAngleRight,
  FaCheckSquare,
  FaStar,
  FaTag,
  FaBoxOpen,
  FaClipboardList,
  FaExclamationTriangle,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

// ─── Tarjeta de métrica ──────────────────────────────────────────────────
const MetricCard = ({ icon, label, value, sub, color }) => (
  <div
    className={`bg-white rounded-xl border border-cin-200 p-5 flex items-center gap-4`}
  >
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-xs text-cin-400 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-display font-semibold text-cin-800">
        {value}
      </p>
      {sub && <p className="text-xs text-cin-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { products, loading, error, refetch } = useProducts(true);
  const [orders, setOrders] = useState({ total: 0, pending: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all"); // all | active | inactive | low_stock | featured

  // Cargar resumen de órdenes
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axiosClient.get("/orders?limit=1");
        const { data: pending } = await axiosClient.get(
          "/orders?status=pendiente&limit=1",
        );
        setOrders({ total: data.total || 0, pending: pending.total || 0 });
      } catch {
        /* silencioso */
      }
    };
    fetchOrders();
  }, []);

  // ── Métricas calculadas ──
  const totalActive = products.filter((p) => p.isActive).length;
  const totalInactive = products.filter((p) => !p.isActive).length;
  const totalFeatured = products.filter((p) => p.isFeatured).length;
  const lowStock = products.filter((p) => p.stock <= 3 && p.stock > 0).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  // ── Filtrado ──
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchFilter =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
          ? p.isActive
          : filterStatus === "inactive"
            ? !p.isActive
            : filterStatus === "low_stock"
              ? p.stock <= 3
              : filterStatus === "featured"
                ? p.isFeatured
                : filterStatus === "offer"
                  ? p.priceOffer && p.priceOffer > 0
                  : true;

    return matchSearch && matchFilter;
  });

  // ── Paginación ──
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage, filterStatus]);

  // ── Acciones individuales ──
  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este producto?")) {
      try {
        await axiosClient.delete(`/products/${id}`);
        toast.success("Producto eliminado");
        refetch();
      } catch {
        toast.error("Error al eliminar");
      }
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await axiosClient.put(`/products/${product._id}`, {
        isActive: !product.isActive,
      });
      toast.info(!product.isActive ? "Producto publicado" : "Producto pausado");
      refetch();
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      await axiosClient.put(`/products/${product._id}`, {
        isFeatured: !product.isFeatured,
      });
      toast.info(
        !product.isFeatured
          ? "⭐ Marcado como destacado"
          : "Quitado de destacados",
      );
      refetch();
    } catch {
      toast.error("Error al cambiar destacado");
    }
  };

  // ── Selección múltiple ──
  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? currentProducts.map((p) => p._id) : []);
  };
  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };
  const handleBulkDelete = async () => {
    if (
      window.confirm(
        `¿Eliminar ${selectedIds.length} productos? Esta acción no se puede deshacer.`,
      )
    ) {
      try {
        await Promise.all(
          selectedIds.map((id) => axiosClient.delete(`/products/${id}`)),
        );
        toast.success(`${selectedIds.length} productos eliminados`);
        setSelectedIds([]);
        refetch();
      } catch {
        toast.error("Error al eliminar algunos productos");
      }
    }
  };

  const filters = [
    { key: "all", label: "Todos", count: products.length },
    { key: "active", label: "Activos", count: totalActive },
    { key: "inactive", label: "Pausados", count: totalInactive },
    { key: "featured", label: "Destacados", count: totalFeatured },
    { key: "low_stock", label: "Stock bajo", count: lowStock + outOfStock },
  ];

  return (
    <AdminLayout>
      {/* ── MÉTRICAS ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display text-2xl text-cin-800">Inventario</h1>
            <p className="text-cin-400 text-sm mt-0.5">
              {products.length} productos en total
            </p>
          </div>
          <Link
            to="/admin/products/new"
            className="bg-cin-700 hover:bg-cin-800 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium text-sm transition-colors shadow-sm"
          >
            <FaPlus size={12} /> Nuevo producto
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            icon={<FaBoxOpen className="text-white" size={18} />}
            label="Activos"
            value={totalActive}
            sub={`${totalInactive} pausados`}
            color="bg-cin-600"
          />
          <MetricCard
            icon={<FaStar className="text-white" size={18} />}
            label="Destacados"
            value={totalFeatured}
            sub="en el home"
            color="bg-gold"
          />
          <MetricCard
            icon={<FaExclamationTriangle className="text-white" size={16} />}
            label="Stock bajo"
            value={lowStock}
            sub={`${outOfStock} sin stock`}
            color="bg-red-500"
          />
          <MetricCard
            icon={<FaClipboardList className="text-white" size={18} />}
            label="Pedidos"
            value={orders.total}
            sub={`${orders.pending} pendientes`}
            color="bg-cin-800"
          />
        </div>
      </div>

      {/* ── FILTROS + BUSCADOR ── */}
      <div className="bg-white rounded-xl border border-cin-200 mb-4 overflow-hidden">
        <div className="p-4 flex flex-wrap gap-3 items-center border-b border-cin-100">
          <div className="relative flex-1 min-w-48">
            <FaSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-300"
              size={13}
            />
            <input
              type="text"
              placeholder="Buscar nombre, SKU, categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-cin-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cin-300 bg-cin-50 text-cin-800 placeholder-cin-300"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === f.key ? "bg-cin-700 text-white" : "bg-cin-50 text-cin-600 hover:bg-cin-100 border border-cin-200"}`}
              >
                {f.label} <span className="opacity-70">({f.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Barra bulk actions */}
        {selectedIds.length > 0 && (
          <div className="bg-cin-50 border-b border-cin-200 px-4 py-2.5 flex justify-between items-center">
            <span className="text-cin-700 font-medium text-sm flex items-center gap-2">
              <FaCheckSquare className="text-cin-600" size={14} />{" "}
              {selectedIds.length} seleccionados
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                Eliminar selección
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-cin-400 text-xs px-3 hover:text-cin-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* ── TABLA ── */}
        {loading && (
          <div className="p-16 flex justify-center">
            <FaSpinner className="animate-spin text-cin-500 text-2xl" />
          </div>
        )}
        {error && (
          <div className="p-10 text-center text-red-500 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-cin-50 text-cin-500 text-xs uppercase tracking-wider border-b border-cin-100">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        className="rounded cursor-pointer w-4 h-4 accent-cin-600"
                        onChange={handleSelectAll}
                        checked={
                          currentProducts.length > 0 &&
                          currentProducts.every((p) =>
                            selectedIds.includes(p._id),
                          )
                        }
                      />
                    </th>
                    <th className="p-4">Producto</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-center">Destacado</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-right">Precio</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cin-100">
                  {currentProducts.map((product) => (
                    <tr
                      key={product._id}
                      className={`hover:bg-cin-50/50 transition-colors ${selectedIds.includes(product._id) ? "bg-cin-50" : ""}`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="rounded cursor-pointer w-4 h-4 accent-cin-600"
                          checked={selectedIds.includes(product._id)}
                          onChange={() => handleSelectRow(product._id)}
                        />
                      </td>

                      {/* Producto */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg border border-cin-200 bg-cin-50 shrink-0 overflow-hidden">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : (
                              <div className="w-full h-full bg-cin-100" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-cin-800 text-sm truncate max-w-[180px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-cin-400 font-mono">
                              {product.sku} ·{" "}
                              <span className="text-cin-500">
                                {product.category?.name}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Toggle activo */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          title={product.isActive ? "Pausar" : "Publicar"}
                          className={`transition-colors ${product.isActive ? "text-green-500 hover:text-green-700" : "text-cin-300 hover:text-cin-500"}`}
                        >
                          {product.isActive ? (
                            <FaToggleOn size={24} />
                          ) : (
                            <FaToggleOff size={24} />
                          )}
                        </button>
                      </td>

                      {/* Toggle destacado */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          title={
                            product.isFeatured
                              ? "Quitar destacado"
                              : "Marcar como destacado"
                          }
                          className={`transition-colors ${product.isFeatured ? "text-gold hover:text-yellow-600" : "text-cin-200 hover:text-gold"}`}
                        >
                          <FaStar size={18} />
                        </button>
                      </td>

                      {/* Stock */}
                      <td className="p-4 text-center">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                            product.stock === 0
                              ? "bg-red-50 text-red-600 border-red-100"
                              : product.stock <= 3
                                ? "bg-amber-50 text-amber-600 border-amber-100"
                                : "bg-green-50 text-green-700 border-green-100"
                          }`}
                        >
                          {product.stock === 0 ? "Sin stock" : product.stock}
                        </span>
                      </td>

                      {/* Precio */}
                      <td className="p-4 text-right">
                        <p className="font-display font-semibold text-cin-700 text-sm">
                          {formatPrice(product.prices?.cash)}
                        </p>
                        {product.priceOffer > 0 && (
                          <p className="text-xs text-cin-400 line-through">
                            {formatPrice(product.priceBase)}
                          </p>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-3">
                          <Link
                            to={`/admin/products/edit/${product._id}`}
                            className="text-cin-300 hover:text-cin-600 transition-colors"
                            title="Editar"
                          >
                            <FaEdit size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-cin-300 hover:text-red-500 transition-colors"
                            title="Eliminar"
                          >
                            <FaTrash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer paginación */}
            {filteredProducts.length > 0 ? (
              <div className="bg-cin-50 p-4 border-t border-cin-100 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center text-sm text-cin-500 gap-2">
                  <span>Filas:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="border border-cin-200 rounded-lg p-1.5 bg-white text-cin-700 text-sm focus:outline-none"
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-cin-400">
                  {startIndex + 1}–
                  {Math.min(startIndex + itemsPerPage, filteredProducts.length)}{" "}
                  de {filteredProducts.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-cin-200 rounded-lg hover:bg-white disabled:opacity-40 text-cin-600 transition-colors"
                  >
                    <FaAngleLeft size={12} />
                  </button>
                  <span className="text-sm text-cin-600 px-2 font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 border border-cin-200 rounded-lg hover:bg-white disabled:opacity-40 text-cin-600 transition-colors"
                  >
                    <FaAngleRight size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-cin-400 text-sm italic">
                No se encontraron productos con ese filtro.
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
