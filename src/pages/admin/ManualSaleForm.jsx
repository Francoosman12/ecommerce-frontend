import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import axiosClient from "../../api/axiosClient";
import { formatPrice } from "../../utils/formatPrice";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaSave,
  FaPlus,
  FaTrash,
  FaSearch,
  FaSpinner,
  FaFileDownload,
  FaQrcode,
} from "react-icons/fa";
import QRPayment from "../../components/admin/QRPayment";

const CHANNELS = [
  { value: "local", label: "Local / presencial" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "otro", label: "Otro" },
];

const PAYMENTS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "mercadopago", label: "Mercado Pago" },
  { value: "otro", label: "Otro" },
];

const ManualSaleForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    paymentMethod: "efectivo",
    paymentNote: "",
    channel: "local",
    discount: "",
    notes: "",
  });

  const [items, setItems] = useState([]);

  useEffect(() => {
    axiosClient.get("/products?all=true").then(({ data }) => setProducts(data));
  }, []);

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()),
    )
    .slice(0, 8);

  const addProduct = (product) => {
    const exists = items.find((i) => i.product === product._id);
    if (exists) {
      setItems((prev) =>
        prev.map((i) =>
          i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          product: product._id,
          name: product.name,
          priceUnit: product.prices?.cash || product.priceBase,
          quantity: 1,
          image: product.images?.[0]?.url || "",
          stock: product.stock,
          sku: product.sku,
        },
      ]);
    }
    setSearch("");
    setShowSearch(false);
  };

  const removeItem = (id) =>
    setItems((prev) => prev.filter((i) => i.product !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) return;
    const item = items.find((i) => i.product === id);
    if (item && qty > item.stock) {
      toast.warning(`Stock disponible: ${item.stock}`);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product === id ? { ...i, quantity: qty } : i)),
    );
  };
  const updatePrice = (id, price) =>
    setItems((prev) =>
      prev.map((i) =>
        i.product === id ? { ...i, priceUnit: Number(price) } : i,
      ),
    );

  const subtotal = items.reduce((acc, i) => acc + i.priceUnit * i.quantity, 0);
  const discountAmt = Number(form.discount) || 0;
  const totalAmount = Math.max(subtotal - discountAmt, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.warning("Agregá al menos un producto");
    setLoading(true);
    try {
      const { data } = await axiosClient.post("/sales/manual", {
        ...form,
        discount: discountAmt,
        totalAmount,
        items: items.map((i) => ({
          product: i.product,
          name: i.name,
          priceUnit: i.priceUnit,
          quantity: i.quantity,
          image: i.image,
        })),
      });
      toast.success("Venta registrada ✅");
      setSavedId(data._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const handleReceipt = async () => {
    try {
      const { data } = await axiosClient.get(
        `/sales/receipt/manual/${savedId}`,
      );
      const win = window.open("", "_blank");
      win.document.write(data);
      win.document.close();
    } catch {
      toast.error("Error al generar el comprobante");
    }
  };

  const inputClass =
    "w-full border border-cin-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cin-300 bg-white text-cin-800 placeholder-cin-300";
  const labelClass =
    "block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2";

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/admin/sales"
            className="p-2 bg-white rounded-xl border border-cin-200 hover:bg-cin-50 text-cin-500 transition-colors"
          >
            <FaArrowLeft size={14} />
          </Link>
          <div>
            <h1 className="font-display text-2xl text-cin-800">
              Registrar venta directa
            </h1>
            <p className="text-cin-400 text-xs mt-0.5">
              Ventas por WhatsApp, Instagram, local o cualquier canal fuera de
              la web
            </p>
          </div>
        </div>

        {/* Si ya se guardó */}
        {savedId && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-green-700 text-sm">
                ✅ Venta registrada correctamente
              </p>
              <p className="text-green-600 text-xs mt-0.5">
                El stock fue descontado automáticamente
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReceipt}
                className="flex items-center gap-2 bg-white border border-green-300 text-green-700 hover:bg-green-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <FaFileDownload size={13} /> Ver comprobante
              </button>
              <button
                onClick={() => {
                  setSavedId(null);
                  setItems([]);
                  setForm({
                    customerName: "",
                    customerPhone: "",
                    paymentMethod: "efectivo",
                    paymentNote: "",
                    channel: "local",
                    discount: "",
                    notes: "",
                  });
                }}
                className="bg-cin-700 hover:bg-cin-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Nueva venta
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Productos */}
          <div className="bg-white rounded-2xl border border-cin-200 p-6">
            <h2 className="font-display text-base text-cin-700 mb-5 pb-3 border-b border-cin-100">
              Productos
            </h2>

            {/* Buscador */}
            <div className="relative mb-4">
              <div className="relative">
                <FaSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-300"
                  size={13}
                />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o SKU..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowSearch(true);
                  }}
                  onFocus={() => setShowSearch(true)}
                  className={`${inputClass} pl-9`}
                />
              </div>
              {showSearch && search && (
                <div className="absolute top-full left-0 right-0 bg-white border border-cin-200 rounded-xl shadow-lg z-20 overflow-hidden mt-1">
                  {filteredProducts.length === 0 ? (
                    <p className="p-3 text-sm text-cin-400 text-center">
                      Sin resultados
                    </p>
                  ) : (
                    filteredProducts.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => addProduct(p)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-cin-50 transition-colors border-b border-cin-100 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-lg border border-cin-100 overflow-hidden bg-cin-50 shrink-0">
                          {p.images?.[0]?.url && (
                            <img
                              src={p.images[0].url}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-cin-700">
                            {p.name}
                          </p>
                          <p className="text-xs text-cin-400">
                            {p.sku} · Stock: {p.stock} ·{" "}
                            {formatPrice(p.prices?.cash)}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Lista de items */}
            {items.length === 0 ? (
              <div className="text-center py-8 text-cin-300 border-2 border-dashed border-cin-200 rounded-xl">
                <p className="text-sm">Buscá y agregá productos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product}
                    className="flex items-center gap-3 p-3 bg-cin-50 rounded-xl border border-cin-100"
                  >
                    <div className="w-10 h-10 rounded-lg border border-cin-200 overflow-hidden bg-white shrink-0">
                      {item.image && (
                        <img
                          src={item.image}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-cin-700 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-cin-400">
                        Stock: {item.stock}
                      </p>
                    </div>
                    {/* Precio editable */}
                    <div className="shrink-0">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-cin-400 text-xs">
                          $
                        </span>
                        <input
                          type="number"
                          value={item.priceUnit}
                          onChange={(e) =>
                            updatePrice(item.product, e.target.value)
                          }
                          className="w-24 pl-5 pr-2 py-1.5 border border-cin-200 rounded-lg text-sm text-cin-700 focus:outline-none focus:ring-1 focus:ring-cin-300 bg-white"
                        />
                      </div>
                    </div>
                    {/* Cantidad */}
                    <div className="flex items-center gap-2 bg-white border border-cin-200 rounded-lg px-2 py-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          updateQty(item.product, item.quantity - 1)
                        }
                        className="text-cin-500 hover:text-cin-700 text-xs"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium text-cin-700 w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQty(item.product, item.quantity + 1)
                        }
                        className="text-cin-500 hover:text-cin-700 text-xs"
                      >
                        +
                      </button>
                    </div>
                    {/* Subtotal */}
                    <span className="text-sm font-display font-semibold text-cin-700 shrink-0 w-24 text-right">
                      {formatPrice(item.priceUnit * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.product)}
                      className="text-cin-300 hover:text-red-400 shrink-0"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}

                {/* Totales */}
                <div className="border-t border-cin-200 pt-3 space-y-2">
                  <div className="flex justify-between text-sm text-cin-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-sm text-red-500">
                      <span>Descuento</span>
                      <span>- {formatPrice(discountAmt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-display font-semibold text-cin-800 text-lg">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cliente y pago */}
          <div className="bg-white rounded-2xl border border-cin-200 p-6">
            <h2 className="font-display text-base text-cin-700 mb-5 pb-3 border-b border-cin-100">
              Cliente y pago
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre del cliente</label>
                <input
                  type="text"
                  placeholder="Opcional"
                  value={form.customerName}
                  onChange={(e) =>
                    setForm({ ...form, customerName: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Teléfono / WhatsApp</label>
                <input
                  type="text"
                  placeholder="Opcional"
                  value={form.customerPhone}
                  onChange={(e) =>
                    setForm({ ...form, customerPhone: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Método de pago *</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm({ ...form, paymentMethod: e.target.value })
                  }
                  className={inputClass}
                >
                  {PAYMENTS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Referencia de pago</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="N° transferencia, MP ID, etc."
                    value={form.paymentNote}
                    onChange={(e) =>
                      setForm({ ...form, paymentNote: e.target.value })
                    }
                    className={inputClass}
                  />
                  {form.paymentMethod === "mercadopago" && items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowQR(true)}
                      className="shrink-0 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-xl text-sm font-medium transition-colors"
                    >
                      <FaQrcode size={14} /> Cobrar
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className={labelClass}>Canal de venta *</label>
                <select
                  value={form.channel}
                  onChange={(e) =>
                    setForm({ ...form, channel: e.target.value })
                  }
                  className={inputClass}
                >
                  {CHANNELS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Descuento ($)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.discount}
                  onChange={(e) =>
                    setForm({ ...form, discount: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Notas internas</label>
                <input
                  type="text"
                  placeholder="Notas opcionales..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Botón guardar */}
          <div className="flex justify-end pb-6">
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="px-8 py-3 bg-cin-700 text-white font-medium rounded-xl shadow-sm hover:bg-cin-800 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" size={14} /> Guardando...
                </>
              ) : (
                <>
                  <FaSave size={14} /> Registrar venta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      {showQR && (
        <QRPayment
          items={items}
          totalAmount={totalAmount}
          onSuccess={() => {
            setShowQR(false);
            toast.success("Pago aprobado por MP ✅");
            setForm((f) => ({ ...f, paymentNote: "Pago QR aprobado" }));
          }}
          onClose={() => setShowQR(false)}
        />
      )}
    </AdminLayout>
  );
};

export default ManualSaleForm;
