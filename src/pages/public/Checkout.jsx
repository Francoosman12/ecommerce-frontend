import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/formatPrice";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import Navbar from "../../components/layout/Navbar";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaStore,
  FaCreditCard,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaCheckCircle,
  FaSpinner,
  FaWhatsapp,
  FaUser,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { SiMercadopago } from "react-icons/si";

const Checkout = () => {
  const { cartItems, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated, isTucuman } = useAuth();
  const navigate = useNavigate();

  // ─── Paso actual del checkout ──────────────────────────────────────────
  const [step, setStep] = useState(1); // 1: Contacto, 2: Entrega, 3: Pago

  // ─── Datos del formulario ──────────────────────────────────────────────
  const [contactInfo, setContactInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  const [delivery, setDelivery] = useState({
    method: "retiro", // 'retiro' | 'envio'
    street: "",
    city: "San Miguel de Tucumán",
    province: "Tucumán",
    zip: "",
    notes: "",
  });

  const [payment, setPayment] = useState({
    method: "mercadopago", // 'mercadopago' | 'efectivo' | 'transferencia'
    selectedFinancingPlan: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Si el carrito está vacío, redirigir
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <span className="text-6xl mb-4">🛒</span>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-500 mb-6">
            Agregá productos antes de continuar.
          </p>
          <Link
            to="/"
            className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  // ─── Validaciones por paso ────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!contactInfo.name.trim()) e.name = "El nombre es obligatorio";
    if (!contactInfo.email.trim()) e.email = "El email es obligatorio";
    if (!contactInfo.phone.trim()) e.phone = "El teléfono es obligatorio";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (delivery.method === "envio" && !delivery.street.trim()) {
      e.street = "La dirección es obligatoria para envío a domicilio";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Avanzar pasos ────────────────────────────────────────────────────
  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  // ─── Obtener planes de financiación disponibles ───────────────────────
  // Solo se muestran si: método de pago = efectivo Y el cliente es de Tucumán
  const showFinancing =
    payment.method === "efectivo" &&
    (isTucuman || delivery.city?.toLowerCase().includes("san miguel"));

  // ─── Enviar orden ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Construir payload
      const orderPayload = {
        customerInfo: contactInfo,
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.qty,
        })),
        deliveryMethod: delivery.method,
        shippingAddress:
          delivery.method === "envio"
            ? {
                street: delivery.street,
                city: delivery.city,
                province: delivery.province,
                zip: delivery.zip,
                notes: delivery.notes,
              }
            : {},
        paymentMethod: payment.method,
        selectedFinancingPlan: payment.selectedFinancingPlan || {},
      };

      // 1. Crear la orden en el backend
      const { data: order } = await axiosClient.post("/orders", orderPayload);

      // 2. Si eligió Mercado Pago → crear preferencia y redirigir
      if (payment.method === "mercadopago") {
        const { data: preference } = await axiosClient.post(
          `/payments/create-preference/${order._id}`,
        );
        clearCart();
        // En desarrollo usamos sandboxUrl, en producción initPoint
        const mpUrl = import.meta.env.DEV
          ? preference.sandboxUrl
          : preference.initPoint;
        window.location.href = mpUrl;
        return;
      }

      // 3. Si eligió efectivo o transferencia → ir a confirmación
      clearCart();
      navigate(`/orden/exito/${order._id}`);
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message || "Error al procesar el pedido";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── UI ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Volver */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 text-sm font-medium transition-colors"
        >
          <FaArrowLeft size={12} /> Seguir comprando
        </Link>

        {/* Indicador de pasos */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { n: 1, label: "Contacto" },
            { n: 2, label: "Entrega" },
            { n: 3, label: "Pago" },
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s.n ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  {step > s.n ? <FaCheckCircle size={16} /> : s.n}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:inline ${step >= s.n ? "text-indigo-600" : "text-gray-400"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`flex-1 h-0.5 transition-colors ${step > s.n ? "bg-indigo-600" : "bg-gray-200"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Formulario ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              {/* PASO 1: Datos de contacto */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaUser className="text-indigo-500" /> Datos de contacto
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Nombre completo *
                      </label>
                      <div className="relative">
                        <FaUser
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={14}
                        />
                        <input
                          type="text"
                          placeholder="Juan García"
                          value={contactInfo.name}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              name: e.target.value,
                            })
                          }
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <FaEnvelope
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={14}
                        />
                        <input
                          type="email"
                          placeholder="tu@email.com"
                          value={contactInfo.email}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              email: e.target.value,
                            })
                          }
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Teléfono / WhatsApp *
                      </label>
                      <div className="relative">
                        <FaPhone
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={14}
                        />
                        <input
                          type="tel"
                          placeholder="381 4000000"
                          value={contactInfo.phone}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              phone: e.target.value,
                            })
                          }
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: Método de entrega */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-indigo-500" /> Método de
                    entrega
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Retiro en local */}
                    <button
                      onClick={() =>
                        setDelivery({ ...delivery, method: "retiro" })
                      }
                      className={`p-5 rounded-xl border-2 text-left transition-all ${delivery.method === "retiro" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <FaStore
                        className={`text-2xl mb-3 ${delivery.method === "retiro" ? "text-indigo-600" : "text-gray-400"}`}
                      />
                      <h3 className="font-bold text-gray-800">
                        Retiro en local
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Silvano Bores 850, SMT
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Lun a Sáb 8:30 a 13:00
                      </p>
                    </button>

                    {/* Envío a domicilio */}
                    <button
                      onClick={() =>
                        setDelivery({ ...delivery, method: "envio" })
                      }
                      className={`p-5 rounded-xl border-2 text-left transition-all ${delivery.method === "envio" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <FaMapMarkerAlt
                        className={`text-2xl mb-3 ${delivery.method === "envio" ? "text-indigo-600" : "text-gray-400"}`}
                      />
                      <h3 className="font-bold text-gray-800">
                        Envío a domicilio
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Coordinamos el envío
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Te contactamos para coordinar
                      </p>
                    </button>
                  </div>

                  {/* Formulario de dirección (solo si eligió envío) */}
                  {delivery.method === "envio" && (
                    <div className="space-y-4 border-t border-gray-100 pt-6">
                      <h3 className="font-bold text-gray-700 text-sm">
                        Dirección de envío
                      </h3>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                          Calle y número *
                        </label>
                        <input
                          type="text"
                          placeholder="Av. Corrientes 1234"
                          value={delivery.street}
                          onChange={(e) =>
                            setDelivery({ ...delivery, street: e.target.value })
                          }
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm ${errors.street ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                        />
                        {errors.street && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.street}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Ciudad
                          </label>
                          <input
                            type="text"
                            value={delivery.city}
                            onChange={(e) =>
                              setDelivery({ ...delivery, city: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Código postal
                          </label>
                          <input
                            type="text"
                            placeholder="4000"
                            value={delivery.zip}
                            onChange={(e) =>
                              setDelivery({ ...delivery, zip: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                          Indicaciones adicionales
                        </label>
                        <input
                          type="text"
                          placeholder="Piso, departamento, referencia..."
                          value={delivery.notes}
                          onChange={(e) =>
                            setDelivery({ ...delivery, notes: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PASO 3: Método de pago */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaCreditCard className="text-indigo-500" /> Método de pago
                  </h2>

                  <div className="space-y-3 mb-6">
                    {/* Mercado Pago */}
                    <button
                      onClick={() =>
                        setPayment({
                          method: "mercadopago",
                          selectedFinancingPlan: null,
                        })
                      }
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${payment.method === "mercadopago" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${payment.method === "mercadopago" ? "bg-indigo-600" : "bg-gray-100"}`}
                      >
                        <FaCreditCard
                          className={
                            payment.method === "mercadopago"
                              ? "text-white"
                              : "text-gray-400"
                          }
                          size={18}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          Mercado Pago
                        </h3>
                        <p className="text-xs text-gray-500">
                          Tarjeta de crédito, débito, transferencia
                        </p>
                      </div>
                    </button>

                    {/* Efectivo */}
                    <button
                      onClick={() =>
                        setPayment({
                          method: "efectivo",
                          selectedFinancingPlan: null,
                        })
                      }
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${payment.method === "efectivo" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${payment.method === "efectivo" ? "bg-indigo-600" : "bg-gray-100"}`}
                      >
                        <FaMoneyBillWave
                          className={
                            payment.method === "efectivo"
                              ? "text-white"
                              : "text-gray-400"
                          }
                          size={18}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">Efectivo</h3>
                        <p className="text-xs text-gray-500">
                          Pagás al retirar o al momento de entrega
                        </p>
                      </div>
                    </button>

                    {/* Transferencia */}
                    <button
                      onClick={() =>
                        setPayment({
                          method: "transferencia",
                          selectedFinancingPlan: null,
                        })
                      }
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${payment.method === "transferencia" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${payment.method === "transferencia" ? "bg-indigo-600" : "bg-gray-100"}`}
                      >
                        <FaExchangeAlt
                          className={
                            payment.method === "transferencia"
                              ? "text-white"
                              : "text-gray-400"
                          }
                          size={18}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          Transferencia bancaria
                        </h3>
                        <p className="text-xs text-gray-500">
                          Te enviamos el CBU por email
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Financiación (solo Tucumán + efectivo) */}
                  {showFinancing && (
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="font-bold text-gray-700 mb-1">
                        Financiación en cuotas
                      </h3>
                      <p className="text-xs text-gray-400 mb-4">
                        Disponible para clientes de San Miguel de Tucumán
                      </p>
                      <div className="space-y-2">
                        {/* Sin cuotas */}
                        <button
                          onClick={() =>
                            setPayment({
                              ...payment,
                              selectedFinancingPlan: null,
                            })
                          }
                          className={`w-full p-3 rounded-xl border-2 text-left transition-all flex justify-between items-center ${!payment.selectedFinancingPlan ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <span className="font-medium text-gray-700 text-sm">
                            Pago en efectivo (sin cuotas)
                          </span>
                          <span className="font-bold text-indigo-600">
                            {formatPrice(totalAmount)}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Nota WhatsApp */}
                  <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200 flex items-start gap-3">
                    <FaWhatsapp
                      className="text-green-500 mt-0.5 shrink-0"
                      size={18}
                    />
                    <p className="text-xs text-green-700">
                      Una vez confirmado el pedido, nos comunicaremos por
                      WhatsApp al número que ingresaste para coordinar los
                      detalles.
                    </p>
                  </div>
                </div>
              )}

              {/* Navegación entre pasos */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                {step > 1 ? (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
                  >
                    <FaArrowLeft size={12} /> Anterior
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    onClick={nextStep}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-sm"
                  >
                    Continuar →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" size={16} />{" "}
                        Procesando...
                      </>
                    ) : payment.method === "mercadopago" ? (
                      "Ir a pagar con MP →"
                    ) : (
                      "Confirmar pedido →"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Resumen del pedido ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4">
                Resumen del pedido
              </h3>

              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                      <img
                        src={item.images?.[0]?.url || "/placeholder.jpg"}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">x{item.qty}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-700 shrink-0">
                      {formatPrice(item.prices.cash * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total</span>
                  <span className="text-xl font-black text-indigo-600">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                {delivery.method === "envio" && (
                  <p className="text-xs text-gray-400 mt-2">
                    * Costo de envío a coordinar
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
