import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/formatPrice";
import axiosClient from "../../api/axiosClient";
import { trackBeginCheckout } from "../../hooks/useAnalytics";
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
  FaShoppingBag,
} from "react-icons/fa";

const Checkout = () => {
  const { cartItems, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated, isTucuman } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [contactInfo, setContactInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  const [delivery, setDelivery] = useState({
    method: "retiro",
    street: "",
    city: "San Miguel de Tucumán",
    province: "Tucumán",
    zip: "",
    notes: "",
  });

  const [payment, setPayment] = useState({
    method: "mercadopago",
    selectedFinancingPlan: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-cin-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <FaShoppingBag className="text-cin-300 mb-4" size={48} />
          <h2 className="font-display text-2xl text-cin-700 mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-cin-400 mb-6 text-sm">
            Agregá productos antes de continuar.
          </p>
          <Link
            to="/"
            className="bg-cin-700 text-white font-medium px-6 py-3 rounded-xl hover:bg-cin-800 transition-colors text-sm"
          >
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  const validateStep1 = () => {
    const e = {};
    if (!contactInfo.name.trim()) e.name = "Obligatorio";
    if (!contactInfo.email.trim()) e.email = "Obligatorio";
    if (!contactInfo.phone.trim()) e.phone = "Obligatorio";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (delivery.method === "envio" && !delivery.street.trim())
      e.street = "La dirección es obligatoria";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 2) trackBeginCheckout(cartItems, totalAmount);
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const showFinancing =
    payment.method === "efectivo" &&
    (isTucuman || delivery.city?.toLowerCase().includes("san miguel"));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
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

      const { data: order } = await axiosClient.post("/orders", orderPayload);

      if (payment.method === "mercadopago") {
        const { data: preference } = await axiosClient.post(
          `/payments/create-preference/${order._id}`,
        );
        clearCart();
        window.location.href = import.meta.env.DEV
          ? preference.sandboxUrl
          : preference.initPoint;
        return;
      }

      clearCart();
      navigate(`/orden/exito/${order._id}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al procesar el pedido",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cin-300 bg-white text-sm text-cin-800 placeholder-cin-300 transition-all ${errors[field] ? "border-red-300" : "border-cin-200"}`;

  const inputWithIcon = (field) =>
    `w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cin-300 bg-white text-sm text-cin-800 placeholder-cin-300 transition-all ${errors[field] ? "border-red-300" : "border-cin-200"}`;

  return (
    <div className="min-h-screen bg-cin-50 flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-cin-500 hover:text-cin-700 mb-6 text-sm font-medium transition-colors"
        >
          <FaArrowLeft size={11} /> Seguir comprando
        </Link>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { n: 1, label: "Contacto" },
            { n: 2, label: "Entrega" },
            { n: 3, label: "Pago" },
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= s.n ? "bg-cin-700 text-white" : "bg-cin-200 text-cin-500"}`}
                >
                  {step > s.n ? <FaCheckCircle size={14} /> : s.n}
                </div>
                <span
                  className={`text-sm hidden sm:inline ${step >= s.n ? "text-cin-700 font-medium" : "text-cin-400"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`flex-1 h-0.5 transition-colors ${step > s.n ? "bg-cin-600" : "bg-cin-200"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-cin-200 p-6 md:p-8">
              {/* PASO 1 */}
              {step === 1 && (
                <div>
                  <h2 className="font-display text-xl text-cin-800 mb-6 flex items-center gap-2">
                    <FaUser className="text-cin-400" size={16} /> Tus datos
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                        Nombre completo *
                      </label>
                      <div className="relative">
                        <FaUser
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-300"
                          size={13}
                        />
                        <input
                          type="text"
                          placeholder="Tu nombre"
                          value={contactInfo.name}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              name: e.target.value,
                            })
                          }
                          className={inputWithIcon("name")}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <FaEnvelope
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-300"
                          size={13}
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
                          className={inputWithIcon("email")}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                        Teléfono / WhatsApp *
                      </label>
                      <div className="relative">
                        <FaPhone
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-300"
                          size={13}
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
                          className={inputWithIcon("phone")}
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

              {/* PASO 2 */}
              {step === 2 && (
                <div>
                  <h2 className="font-display text-xl text-cin-800 mb-6 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-cin-400" size={16} /> Método
                    de entrega
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {[
                      {
                        key: "retiro",
                        icon: <FaStore size={20} />,
                        title: "Retiro en local",
                        sub1: "San Miguel de Tucumán",
                        sub2: "Lun a Sáb 9:00 a 18:00",
                      },
                      {
                        key: "envio",
                        icon: <FaMapMarkerAlt size={20} />,
                        title: "Envío a domicilio",
                        sub1: "Coordinamos el envío",
                        sub2: "Te contactamos para coordinar",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() =>
                          setDelivery({ ...delivery, method: opt.key })
                        }
                        className={`p-5 rounded-xl border-2 text-left transition-all ${delivery.method === opt.key ? "border-cin-600 bg-cin-50" : "border-cin-200 hover:border-cin-300"}`}
                      >
                        <div
                          className={`mb-2 ${delivery.method === opt.key ? "text-cin-600" : "text-cin-300"}`}
                        >
                          {opt.icon}
                        </div>
                        <h3 className="font-medium text-cin-800 text-sm">
                          {opt.title}
                        </h3>
                        <p className="text-xs text-cin-500 mt-0.5">
                          {opt.sub1}
                        </p>
                        <p className="text-xs text-cin-400">{opt.sub2}</p>
                      </button>
                    ))}
                  </div>

                  {delivery.method === "envio" && (
                    <div className="space-y-4 border-t border-cin-100 pt-5">
                      <h3 className="text-sm font-medium text-cin-700">
                        Dirección de envío
                      </h3>
                      <div>
                        <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                          Calle y número *
                        </label>
                        <input
                          type="text"
                          placeholder="Av. Corrientes 1234"
                          value={delivery.street}
                          onChange={(e) =>
                            setDelivery({ ...delivery, street: e.target.value })
                          }
                          className={inputClass("street")}
                        />
                        {errors.street && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.street}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                            Ciudad
                          </label>
                          <input
                            type="text"
                            value={delivery.city}
                            onChange={(e) =>
                              setDelivery({ ...delivery, city: e.target.value })
                            }
                            className={inputClass("")}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                            Código postal
                          </label>
                          <input
                            type="text"
                            placeholder="4000"
                            value={delivery.zip}
                            onChange={(e) =>
                              setDelivery({ ...delivery, zip: e.target.value })
                            }
                            className={inputClass("")}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                          Indicaciones
                        </label>
                        <input
                          type="text"
                          placeholder="Piso, depto, referencia..."
                          value={delivery.notes}
                          onChange={(e) =>
                            setDelivery({ ...delivery, notes: e.target.value })
                          }
                          className={inputClass("")}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PASO 3 */}
              {step === 3 && (
                <div>
                  <h2 className="font-display text-xl text-cin-800 mb-6 flex items-center gap-2">
                    <FaCreditCard className="text-cin-400" size={16} /> Método
                    de pago
                  </h2>
                  <div className="space-y-3 mb-5">
                    {[
                      {
                        key: "mercadopago",
                        icon: <FaCreditCard size={18} />,
                        title: "Mercado Pago",
                        sub: "Tarjeta de crédito, débito, transferencia",
                      },
                      {
                        key: "efectivo",
                        icon: <FaMoneyBillWave size={18} />,
                        title: "Efectivo",
                        sub: "Pagás al retirar o al recibir",
                      },
                      {
                        key: "transferencia",
                        icon: <FaExchangeAlt size={18} />,
                        title: "Transferencia bancaria",
                        sub: "Te enviamos el CBU por email",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() =>
                          setPayment({
                            method: opt.key,
                            selectedFinancingPlan: null,
                          })
                        }
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${payment.method === opt.key ? "border-cin-600 bg-cin-50" : "border-cin-200 hover:border-cin-300"}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${payment.method === opt.key ? "bg-cin-700 text-white" : "bg-cin-100 text-cin-400"}`}
                        >
                          {opt.icon}
                        </div>
                        <div>
                          <p className="font-medium text-cin-800 text-sm">
                            {opt.title}
                          </p>
                          <p className="text-xs text-cin-500">{opt.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {showFinancing && (
                    <div className="border-t border-cin-100 pt-5">
                      <h3 className="text-sm font-medium text-cin-700 mb-1">
                        Financiación en cuotas
                      </h3>
                      <p className="text-xs text-cin-400 mb-3">
                        Disponible para San Miguel de Tucumán
                      </p>
                      <button
                        onClick={() =>
                          setPayment({
                            ...payment,
                            selectedFinancingPlan: null,
                          })
                        }
                        className={`w-full p-3 rounded-xl border-2 flex justify-between items-center text-sm transition-all ${!payment.selectedFinancingPlan ? "border-cin-600 bg-cin-50" : "border-cin-200 hover:border-cin-300"}`}
                      >
                        <span className="font-medium text-cin-700">
                          Pago en efectivo (sin cuotas)
                        </span>
                        <span className="font-display font-semibold text-cin-600">
                          {formatPrice(totalAmount)}
                        </span>
                      </button>
                    </div>
                  )}

                  <div className="mt-5 p-4 bg-green-50 rounded-xl border border-green-200 flex items-start gap-3">
                    <FaWhatsapp
                      className="text-green-500 mt-0.5 shrink-0"
                      size={16}
                    />
                    <p className="text-xs text-green-700">
                      Una vez confirmado el pedido, nos comunicaremos por
                      WhatsApp para coordinar los detalles.
                    </p>
                  </div>
                </div>
              )}

              {/* Navegación */}
              <div className="flex justify-between mt-8 pt-6 border-t border-cin-100">
                {step > 1 ? (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-2 text-cin-500 hover:text-cin-700 font-medium text-sm transition-colors"
                  >
                    <FaArrowLeft size={11} /> Anterior
                  </button>
                ) : (
                  <div />
                )}
                {step < 3 ? (
                  <button
                    onClick={nextStep}
                    className="bg-cin-700 hover:bg-cin-800 text-white font-medium px-8 py-3 rounded-xl transition-colors text-sm"
                  >
                    Continuar →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-cin-700 hover:bg-cin-800 disabled:opacity-60 text-white font-medium px-8 py-3 rounded-xl transition-colors flex items-center gap-2 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" size={14} />{" "}
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

          {/* Resumen */}
          <div>
            <div className="bg-white rounded-2xl border border-cin-200 p-5 sticky top-24">
              <h3 className="font-display text-cin-800 mb-4">Resumen</h3>
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <div className="w-11 h-11 rounded-lg overflow-hidden border border-cin-100 bg-cin-50 shrink-0">
                      {item.images?.[0]?.url && (
                        <img
                          src={item.images[0].url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-cin-700 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-cin-400">x{item.qty}</p>
                    </div>
                    <span className="text-xs font-medium text-cin-700 shrink-0">
                      {formatPrice(item.prices.cash * item.qty)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-cin-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-cin-600 text-sm">Total</span>
                  <span className="font-display text-xl text-cin-700 font-semibold">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                {delivery.method === "envio" && (
                  <p className="text-xs text-cin-400 mt-1">
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
