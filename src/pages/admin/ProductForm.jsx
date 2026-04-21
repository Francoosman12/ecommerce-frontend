import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import AdminLayout from "../../components/layout/AdminLayout";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaSave,
  FaCloudUploadAlt,
  FaSpinner,
  FaTimes,
  FaStar,
  FaTag,
} from "react-icons/fa";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    priceBase: "",
    priceOffer: "", // ← NUEVO: precio de oferta (opcional)
    category: "",
    stock: 0,
    description: "",
    videoUrl: "",
    isActive: true,
    isFeatured: false, // ← NUEVO: destacado
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // ── Cargar datos iniciales ──
  useEffect(() => {
    const load = async () => {
      try {
        const catRes = await axiosClient.get("/categories");
        setCategories(catRes.data);
        if (!isEditing && catRes.data.length > 0) {
          setFormData((prev) => ({ ...prev, category: catRes.data[0]._id }));
        }

        if (isEditing) {
          setFetchingData(true);
          const prodRes = await axiosClient.get(`/products/${id}`);
          const prod = prodRes.data;
          setFormData({
            name: prod.name,
            sku: prod.sku,
            priceBase: prod.priceBase,
            priceOffer: prod.priceOffer || "",
            category: prod.category?._id || prod.category,
            stock: prod.stock,
            description: prod.description || "",
            videoUrl: prod.videoUrl || "",
            isActive: prod.isActive,
            isFeatured: prod.isFeatured || false,
          });
          setExistingImages(prod.images || []);
          setFetchingData(false);
        }
      } catch {
        toast.error("Error al cargar datos");
        setFetchingData(false);
      }
    };
    load();
  }, [isEditing, id]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ── Imágenes ──
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const total = existingImages.length + files.length + selected.length;
    if (total > 5) {
      toast.warning(
        `Solo se permiten 5 imágenes. Ya tenés ${existingImages.length + files.length}.`,
      );
      return;
    }
    setFiles([...files, ...selected]);
    setPreviews([...previews, ...selected.map((f) => URL.createObjectURL(f))]);
  };

  const removeNewImage = (i) => {
    setFiles(files.filter((_, j) => j !== i));
    setPreviews(previews.filter((_, j) => j !== i));
  };
  const removeExistingImage = (imgId) =>
    setExistingImages((prev) => prev.filter((img) => img._id !== imgId));

  // ── Descripción con límite de palabras ──
  const MAX_WORDS = 80;
  const currentWords = formData.description
    ? formData.description
        .trim()
        .split(/\s+/)
        .filter((w) => w !== "").length
    : 0;

  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w !== "");
    if (
      words.length <= MAX_WORDS ||
      text.length < formData.description.length
    ) {
      setFormData({ ...formData, description: text });
    }
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return toast.warning("Seleccioná una categoría");
    if (existingImages.length + files.length === 0)
      return toast.warning("Necesitás al menos 1 imagen");

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      files.forEach((file) => data.append("images", file));
      data.append("existingImages", JSON.stringify(existingImages));

      if (isEditing) {
        await axiosClient.put(`/products/${id}`, data);
        toast.success("Producto actualizado");
      } else {
        await axiosClient.post("/products", data);
        toast.success("Producto creado");
      }
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData)
    return (
      <AdminLayout>
        <div className="flex justify-center p-20">
          <FaSpinner className="animate-spin text-cin-500 text-2xl" />
        </div>
      </AdminLayout>
    );

  const inputClass =
    "w-full border border-cin-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cin-300 focus:border-cin-400 bg-white text-cin-800 text-sm placeholder-cin-300 transition-all";
  const labelClass =
    "block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2";

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/admin/dashboard"
            className="p-2 bg-white rounded-xl border border-cin-200 hover:bg-cin-50 text-cin-500 transition-colors"
          >
            <FaArrowLeft size={14} />
          </Link>
          <div>
            <h1 className="font-display text-2xl text-cin-800">
              {isEditing ? "Editar producto" : "Nuevo producto"}
            </h1>
            <p className="text-cin-400 text-xs mt-0.5">
              {isEditing
                ? "Actualizá los datos del producto"
                : "Completá los campos para agregar al catálogo"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Sección 1: Datos básicos ── */}
          <div className="bg-white rounded-2xl border border-cin-200 p-6">
            <h2 className="font-display text-base text-cin-700 mb-5 pb-3 border-b border-cin-100">
              Información básica
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>Nombre *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ej: Bufandón lana merino"
                />
              </div>
              <div>
                <label className={labelClass}>SKU *</label>
                <input
                  type="text"
                  name="sku"
                  required
                  value={formData.sku}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ej: BUF-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={labelClass}>Categoría *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Seleccionar...
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Stock</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col justify-end">
                {/* placeholder para alinear */}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={labelClass}>Descripción</label>
                <span
                  className={`text-xs font-medium ${currentWords >= MAX_WORDS ? "text-red-500" : "text-cin-400"}`}
                >
                  {currentWords} / {MAX_WORDS} palabras
                </span>
              </div>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleDescriptionChange}
                className={`${inputClass} resize-none ${currentWords >= MAX_WORDS ? "border-red-300 focus:ring-red-200" : ""}`}
                placeholder="Describí el material, las medidas, los colores disponibles..."
              />
            </div>
          </div>

          {/* ── Sección 2: Precios ── */}
          <div className="bg-white rounded-2xl border border-cin-200 p-6">
            <h2 className="font-display text-base text-cin-700 mb-5 pb-3 border-b border-cin-100">
              Precios
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Precio base (contado) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-400 font-medium text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    name="priceBase"
                    required
                    min="0"
                    value={formData.priceBase}
                    onChange={handleChange}
                    className={`${inputClass} pl-7`}
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-cin-400 mt-1">
                  Es el precio principal de la tienda.
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  <FaTag className="inline mr-1 text-cin-500" size={10} />
                  Precio de oferta{" "}
                  <span className="normal-case text-cin-400 font-normal">
                    (opcional)
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cin-400 font-medium text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    name="priceOffer"
                    min="0"
                    value={formData.priceOffer}
                    onChange={handleChange}
                    className={`${inputClass} pl-7 border-cin-300`}
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-cin-400 mt-1">
                  Si lo completás, el precio base aparece tachado y este como
                  precio final.
                </p>
              </div>
            </div>

            {/* Preview de cómo se verá */}
            {formData.priceOffer > 0 && formData.priceBase > 0 && (
              <div className="mt-4 p-3 bg-cin-50 rounded-xl border border-cin-200 flex items-center gap-3">
                <span className="text-xs text-cin-500">Vista previa:</span>
                <span className="text-sm text-cin-400 line-through">
                  ${Number(formData.priceBase).toLocaleString("es-AR")}
                </span>
                <span className="font-display font-semibold text-cin-700">
                  ${Number(formData.priceOffer).toLocaleString("es-AR")}
                </span>
                <span className="text-xs bg-cin-600 text-white px-2 py-0.5 rounded-full">
                  -
                  {Math.round(
                    (1 - formData.priceOffer / formData.priceBase) * 100,
                  )}
                  % OFF
                </span>
              </div>
            )}
          </div>

          {/* ── Sección 3: Imágenes ── */}
          <div className="bg-white rounded-2xl border border-cin-200 p-6">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-cin-100">
              <h2 className="font-display text-base text-cin-700">
                Galería de imágenes
              </h2>
              <span className="text-xs bg-cin-100 text-cin-600 px-2 py-1 rounded-full font-medium">
                {existingImages.length + files.length} / 5
              </span>
            </div>

            <div className="flex gap-3 flex-wrap">
              {/* Botón subir */}
              {existingImages.length + files.length < 5 && (
                <div className="relative h-28 w-28">
                  <div className="absolute inset-0 border-2 border-dashed border-cin-300 rounded-xl flex flex-col items-center justify-center text-cin-400 bg-cin-50 hover:bg-cin-100 transition-colors pointer-events-none">
                    <FaCloudUploadAlt size={22} />
                    <span className="text-xs font-medium mt-1">Agregar</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}

              {/* Imágenes existentes */}
              {existingImages.map((img) => (
                <div
                  key={img._id}
                  className="h-28 w-28 rounded-xl overflow-hidden border border-cin-200 relative group"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img._id)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <FaTimes size={9} />
                  </button>
                  <div className="absolute bottom-0 w-full bg-black/50 text-white text-[10px] text-center py-0.5">
                    Guardada
                  </div>
                </div>
              ))}

              {/* Nuevas imágenes */}
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="h-28 w-28 rounded-xl overflow-hidden border-2 border-cin-400 relative group shadow-sm"
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <FaTimes size={9} />
                  </button>
                  <div className="absolute bottom-0 w-full bg-cin-600 text-white text-[10px] text-center py-0.5 font-medium">
                    Nueva
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sección 4: Extras ── */}
          <div className="bg-white rounded-2xl border border-cin-200 p-6">
            <h2 className="font-display text-base text-cin-700 mb-5 pb-3 border-b border-cin-100">
              Extras
            </h2>

            <div className="mb-4">
              <label className={labelClass}>Video (YouTube o TikTok)</label>
              <input
                type="text"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                className={inputClass}
                placeholder="https://youtu.be/..."
              />
              <p className="text-xs text-cin-400 mt-1">
                Soporta YouTube, Shorts y TikTok.
              </p>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Publicado */}
              <div
                className={`p-4 rounded-xl border-2 flex items-center justify-between transition-colors ${formData.isActive ? "border-green-300 bg-green-50" : "border-cin-200 bg-cin-50"}`}
              >
                <div>
                  <p className="font-medium text-cin-800 text-sm">Publicado</p>
                  <p className="text-xs text-cin-400 mt-0.5">
                    Visible en la tienda pública
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  <div className="w-10 h-5 bg-cin-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>

              {/* Destacado */}
              <div
                className={`p-4 rounded-xl border-2 flex items-center justify-between transition-colors ${formData.isFeatured ? "border-yellow-300 bg-yellow-50" : "border-cin-200 bg-cin-50"}`}
              >
                <div className="flex items-start gap-2">
                  <FaStar
                    className={
                      formData.isFeatured
                        ? "text-gold mt-0.5"
                        : "text-cin-300 mt-0.5"
                    }
                    size={14}
                  />
                  <div>
                    <p className="font-medium text-cin-800 text-sm">
                      Destacado
                    </p>
                    <p className="text-xs text-cin-400 mt-0.5">
                      Aparece en la sección destacados del Home
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                  />
                  <div className="w-10 h-5 bg-cin-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-yellow-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>
            </div>
          </div>

          {/* ── Botón guardar ── */}
          <div className="flex justify-end pb-6">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-cin-700 text-white font-medium rounded-xl shadow-sm hover:bg-cin-800 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" size={14} /> Guardando...
                </>
              ) : (
                <>
                  <FaSave size={14} /> Guardar producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;
