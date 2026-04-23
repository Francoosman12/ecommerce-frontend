import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import {
  FaPercentage,
  FaCreditCard,
  FaSave,
  FaTrash,
  FaPlus,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

const FinancialManager = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({ cashDiscount: 0, cardPlans: [] });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axiosClient.get("/financial");
        if (data)
          setConfig({
            cashDiscount: data.cashDiscount || 0,
            cardPlans: data.cardPlans || [],
          });
      } catch {
        toast.error("Error al cargar configuración financiera");
      }
    };
    fetch();
  }, []);

  const handlePlanChange = (index, field, value) => {
    const updated = [...config.cardPlans];
    updated[index][field] = field === "name" ? value : Number(value);
    setConfig({ ...config, cardPlans: updated });
  };

  const togglePlan = (index) => {
    const updated = [...config.cardPlans];
    updated[index].isActive = !updated[index].isActive;
    setConfig({ ...config, cardPlans: updated });
  };

  const addPlan = () =>
    setConfig({
      ...config,
      cardPlans: [
        ...config.cardPlans,
        { name: "", installments: 3, interestRate: 0, isActive: true },
      ],
    });

  const removePlan = (index) =>
    setConfig({
      ...config,
      cardPlans: config.cardPlans.filter((_, i) => i !== index),
    });

  const handleSave = async () => {
    setLoading(true);
    try {
      await axiosClient.put("/financial", config);
      toast.success("Configuración guardada");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-cin-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cin-300 bg-white text-cin-800";

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-2xl text-cin-800 flex items-center gap-3">
              <FaPercentage className="text-cin-600" size={18} /> Tasas y
              Precios
            </h1>
            <p className="text-cin-400 text-sm mt-1">
              Controlá los precios y cuotas de tu tienda.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-cin-700 hover:bg-cin-800 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 text-sm transition-colors shadow-sm disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaSave size={14} />
            )}
            Guardar cambios
          </button>
        </div>

        <div className="space-y-5">
          {/* Margen precio de lista */}
          <div className="bg-white rounded-2xl border border-cin-200 p-6">
            <h2 className="font-display text-base text-cin-700 mb-5 pb-3 border-b border-cin-100 flex items-center gap-2">
              <div className="w-8 h-8 bg-cin-100 rounded-lg flex items-center justify-center">
                <FaPercentage className="text-cin-600" size={14} />
              </div>
              Margen de precio de lista
            </h2>
            <div className="flex items-start gap-6">
              <div className="relative w-36 shrink-0">
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={config.cashDiscount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      cashDiscount: Number(e.target.value),
                    })
                  }
                  className={`${inputClass} text-center text-2xl font-display font-semibold pr-8`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cin-400 font-bold">
                  %
                </span>
              </div>
              <div className="text-sm text-cin-500 leading-relaxed pt-2">
                <p>
                  Este porcentaje{" "}
                  <strong className="text-cin-700">se suma</strong> al precio
                  base para mostrar el "precio de lista" tachado en la tienda.
                </p>
                <p className="text-xs text-cin-400 mt-1">
                  Ejemplo: producto a $10.000 con 45% → lista $14.500 tachado,
                  contado $10.000.
                </p>

                {/* Preview */}
                {config.cashDiscount > 0 && (
                  <div className="mt-3 bg-cin-50 rounded-xl p-3 border border-cin-200 inline-flex items-center gap-3">
                    <span className="text-cin-400 line-through text-sm">
                      $
                      {(10000 * (1 + config.cashDiscount / 100)).toLocaleString(
                        "es-AR",
                      )}
                    </span>
                    <span className="font-display font-semibold text-cin-700">
                      $10.000
                    </span>
                    <span className="text-xs bg-cin-600 text-white px-2 py-0.5 rounded-full">
                      {config.cashDiscount}% OFF
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Planes de tarjeta */}
          <div className="bg-white rounded-2xl border border-cin-200 p-6">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-cin-100">
              <h2 className="font-display text-base text-cin-700 flex items-center gap-2">
                <div className="w-8 h-8 bg-cin-100 rounded-lg flex items-center justify-center">
                  <FaCreditCard className="text-cin-600" size={14} />
                </div>
                Planes de cuotas con tarjeta
              </h2>
              <button
                onClick={addPlan}
                className="flex items-center gap-2 text-cin-600 hover:text-cin-800 font-medium text-sm transition-colors"
              >
                <FaPlus size={11} /> Agregar plan
              </button>
            </div>

            <div className="space-y-3">
              {config.cardPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row gap-3 items-end md:items-center p-4 rounded-xl border transition-colors ${
                    plan.isActive
                      ? "bg-cin-50 border-cin-200"
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-1.5">
                      Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Ahora 12"
                      value={plan.name}
                      onChange={(e) =>
                        handlePlanChange(index, "name", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="w-full md:w-28">
                    <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-1.5">
                      Cuotas
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={plan.installments}
                      onChange={(e) =>
                        handlePlanChange(index, "installments", e.target.value)
                      }
                      className={`${inputClass} text-center font-display font-semibold`}
                    />
                  </div>
                  <div className="w-full md:w-32 relative">
                    <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-1.5">
                      Interés (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={plan.interestRate}
                      onChange={(e) =>
                        handlePlanChange(index, "interestRate", e.target.value)
                      }
                      className={`${inputClass} text-right pr-7 font-display font-semibold`}
                    />
                    <span className="absolute right-3 bottom-3 text-cin-400 text-sm">
                      %
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => togglePlan(index)}
                      title={plan.isActive ? "Desactivar" : "Activar"}
                      className={`transition-colors ${plan.isActive ? "text-green-500 hover:text-green-700" : "text-cin-300 hover:text-cin-500"}`}
                    >
                      {plan.isActive ? (
                        <FaToggleOn size={22} />
                      ) : (
                        <FaToggleOff size={22} />
                      )}
                    </button>
                    <button
                      onClick={() => removePlan(index)}
                      className="p-2 text-cin-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaTrash size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {config.cardPlans.length === 0 && (
                <div className="text-center py-8 text-cin-400 text-sm italic border-2 border-dashed border-cin-100 rounded-xl">
                  No hay planes de tarjeta configurados.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FinancialManager;
