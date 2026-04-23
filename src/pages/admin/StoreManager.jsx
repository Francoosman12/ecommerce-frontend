import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import {
  FaStore,
  FaSave,
  FaInstagram,
  FaWhatsapp,
  FaGlobe,
  FaImage,
} from "react-icons/fa";

const StoreManager = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [config, setConfig] = useState({
    storeName: "Margarita Accesorios",
    storeAddress: "San Miguel de Tucumán, Argentina",
    storeHours: "Lunes a Sábado de 9:00 a 18:00",
    storeEmail: "",
    whatsappPhone: "",
    instagramUrl: "",
    instagramFollowers: "",
    facebookUrl: "",
    reelUrl: "",
    heroBadgeText: "Nueva colección · Otoño Invierno",
    heroTitle: "Bufandones que te abrazan",
    heroSubtitle:
      "Lana seleccionada, colores únicos y diseños artesanales para la mujer que sabe lo que quiere.",
    seoTitle: "",
    seoDescription: "",
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axiosClient.get("/store");
        if (data) setConfig((prev) => ({ ...prev, ...data }));
      } catch {
        toast.error("Error al cargar configuración");
      } finally {
        setFetching(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (e) =>
    setConfig({ ...config, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    try {
      await axiosClient.put("/store", config);
      toast.success("✅ Configuración guardada");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cin-300 focus:border-cin-400 bg-white text-cin-800 placeholder-gray-300";
  const labelClass =
    "block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2";

  if (fetching)
    return (
      <AdminLayout>
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-cin-500 border-t-transparent" />
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-2xl text-cin-800 flex items-center gap-3">
              <FaStore className="text-cin-600" size={20} /> Configuración de
              tienda
            </h1>
            <p className="text-cin-400 text-sm mt-1">
              Personalizá el contenido y los datos de tu tienda
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
          {/* ── Reel Instagram ── */}
          <div className="bg-white rounded-2xl border border-cin-200 p-6">
            <h2 className="font-display text-base text-cin-700 mb-5 pb-3 border-b border-cin-100 flex items-center gap-2">
              <FaImage className="text-cin-500" size={16} /> Reel en el banner
            </h2>
            <div>
              <label className={labelClass}>URL del Reel de Instagram</label>
              <input
                type="text"
                name="reelUrl"
                value={config.reelUrl}
                onChange={handleChange}
                className={inputClass}
                placeholder="https://www.instagram.com/reel/XXXXXX/"
              />
              <p className="text-xs text-cin-400 mt-1.5">
                Pegá la URL del Reel que querés mostrar en el banner. Se
                actualiza al guardar.
              </p>
            </div>
            {config.reelUrl && (
              <div className="mt-4 flex gap-6 items-start">
                <div
                  className="rounded-xl overflow-hidden border-2 border-cin-200 shrink-0"
                  style={{ width: 140, height: 248 }}
                >
                  <iframe
                    src={`${config.reelUrl.replace(/\/$/, "")}/embed/`}
                    width="140"
                    height="248"
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency="true"
                    title="Preview Reel"
                    style={{ display: "block" }}
                  />
                </div>
                <div className="text-sm text-cin-500 pt-2">
                  <p className="font-medium text-cin-700 mb-1">Vista previa</p>
                  <p className="text-xs leading-relaxed">
                    Así se ve el Reel en el banner. Puede tardar unos segundos
                    en cargar.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Banner / Hero ── */}
          <div className="bg-white rounded-2xl border border-cin-200 p-6">
            <h2 className="font-display text-base text-cin-700 mb-5 pb-3 border-b border-cin-100 flex items-center gap-2">
              <FaGlobe className="text-cin-500" size={16} /> Texto del banner
              principal
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>
                  Badge (texto pequeño arriba)
                </label>
                <input
                  type="text"
                  name="heroBadgeText"
                  value={config.heroBadgeText}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Título principal</label>
                <input
                  type="text"
                  name="heroTitle"
                  value={config.heroTitle}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Subtítulo</label>
                <textarea
                  name="heroSubtitle"
                  value={config.heroSubtitle}
                  onChange={handleChange}
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </div>

          {/* ── Redes y contacto ── */}
          <div className="bg-white rounded-2xl border border-cin-200 p-6">
            <h2 className="font-display text-base text-cin-700 mb-5 pb-3 border-b border-cin-100 flex items-center gap-2">
              <FaInstagram className="text-cin-500" size={16} /> Redes y
              contacto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Teléfono WhatsApp</label>
                <div className="relative">
                  <FaWhatsapp
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500"
                    size={14}
                  />
                  <input
                    type="text"
                    name="whatsappPhone"
                    value={config.whatsappPhone}
                    onChange={handleChange}
                    className={`${inputClass} pl-9`}
                    placeholder="5493816312804"
                  />
                </div>
                <p className="text-xs text-cin-400 mt-1">
                  Sin + ni espacios. Ej: 5493816312804
                </p>
              </div>
              <div>
                <label className={labelClass}>Instagram URL</label>
                <div className="relative">
                  <FaInstagram
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500"
                    size={14}
                  />
                  <input
                    type="text"
                    name="instagramUrl"
                    value={config.instagramUrl}
                    onChange={handleChange}
                    className={`${inputClass} pl-9`}
                    placeholder="https://www.instagram.com/margarita_accesorios.11"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Seguidores en Instagram</label>
                <input
                  type="text"
                  name="instagramFollowers"
                  value={config.instagramFollowers}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ej: 2.4K o 1,200"
                />
                <p className="text-xs text-cin-400 mt-1">
                  Se muestra en la sección Instagram del Home.
                </p>
              </div>
              <div>
                <label className={labelClass}>Email de contacto</label>
                <input
                  type="email"
                  name="storeEmail"
                  value={config.storeEmail}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="hola@margarita.com.ar"
                />
              </div>
              <div>
                <label className={labelClass}>Horario de atención</label>
                <input
                  type="text"
                  name="storeHours"
                  value={config.storeHours}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* ── Info del negocio ── */}
          <div className="bg-white rounded-2xl border border-cin-200 p-6">
            <h2 className="font-display text-base text-cin-700 mb-5 pb-3 border-b border-cin-100 flex items-center gap-2">
              <FaStore className="text-cin-500" size={16} /> Información del
              negocio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre de la tienda</label>
                <input
                  type="text"
                  name="storeName"
                  value={config.storeName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Dirección</label>
                <input
                  type="text"
                  name="storeAddress"
                  value={config.storeAddress}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* ── SEO ── */}
          <div className="bg-white rounded-2xl border border-cin-200 p-6">
            <h2 className="font-display text-base text-cin-700 mb-5 pb-3 border-b border-cin-100 flex items-center gap-2">
              <FaGlobe className="text-cin-500" size={16} /> SEO
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Título SEO</label>
                <input
                  type="text"
                  name="seoTitle"
                  value={config.seoTitle}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Margarita Accesorios — Bufandones y Moda Femenina"
                />
                <p className="text-xs text-cin-400 mt-1">
                  Máximo 60 caracteres recomendado (
                  {config.seoTitle?.length || 0}/60)
                </p>
              </div>
              <div>
                <label className={labelClass}>Descripción SEO</label>
                <textarea
                  name="seoDescription"
                  value={config.seoDescription}
                  onChange={handleChange}
                  rows={2}
                  className={`${inputClass} resize-none`}
                  placeholder="Bufandones artesanales y accesorios de moda femenina en Tucumán..."
                />
                <p className="text-xs text-cin-400 mt-1">
                  Máximo 160 caracteres recomendado (
                  {config.seoDescription?.length || 0}/160)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StoreManager;
