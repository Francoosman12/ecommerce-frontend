import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useSEO from "../../hooks/useSEO";
import { trackViewProduct } from "../../hooks/useAnalytics";
import { useProductSchema, useBreadcrumbSchema } from "../../hooks/useSchema";
import axiosClient from "../../api/axiosClient";
import { formatPrice } from "../../utils/formatPrice";
import {
  FaWhatsapp,
  FaArrowLeft,
  FaShieldAlt,
  FaTruck,
  FaPlay,
  FaShoppingBag,
  FaStar,
  FaTag,
} from "react-icons/fa";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useCart } from "../../context/CartContext";

// ─── Helpers de video ────────────────────────────────────────────────────
const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp =
    /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})(?:.+)?$/;
  const match = url.match(regExp);
  return match?.[1] || null;
};

const getTikTokId = (url) => {
  if (!url) return null;
  const match = url.match(/\/video\/(\d+)/);
  return match?.[1] || null;
};

// ─── Productos relacionados ──────────────────────────────────────────────
const RelatedProducts = ({ categoryId, currentId }) => {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!categoryId) return;
    const fetchRelated = async () => {
      try {
        const { data } = await axiosClient.get("/products");
        const filtered = data
          .filter(
            (p) =>
              p.category?._id === categoryId &&
              p._id !== currentId &&
              p.isActive,
          )
          .slice(0, 4);
        setRelated(filtered);
      } catch {
        /* silencioso */
      }
    };
    fetchRelated();
  }, [categoryId, currentId]);

  if (related.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="font-display text-2xl text-cin-800 mb-6">
        También te puede interesar
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {related.map((p) => (
          <Link
            key={p._id}
            to={`/product/${p._id}`}
            onClick={() => window.scrollTo(0, 0)}
            className="bg-white rounded-2xl overflow-hidden border border-cin-100 hover:shadow-lg transition-all duration-300 group flex flex-col"
          >
            <div className="h-44 overflow-hidden bg-cin-100">
              {p.images?.[0]?.url ? (
                <img
                  src={p.images[0].url}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-cin-100 flex items-center justify-center">
                  <FaShoppingBag className="text-cin-300" size={28} />
                </div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-cin-500 text-xs font-medium uppercase tracking-wide mb-1">
                  {p.category?.name}
                </p>
                <h3 className="font-display text-sm text-cin-800 line-clamp-2 leading-snug">
                  {p.name}
                </h3>
              </div>
              <p className="font-display font-semibold text-cin-700 mt-3">
                {formatPrice(p.prices?.cash)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // SEO dinámico — se actualiza cuando carga el producto
  useSEO({
    title: product
      ? `${product.name} — Margarita Accesorios`
      : "Margarita Accesorios",
    description:
      product?.description ||
      "Bufandones artesanales y accesorios de moda femenina en Tucumán.",
    image: product?.images?.[0]?.url || "/og-image.jpg",
    url: typeof window !== "undefined" ? window.location.href : "",
    type: "product",
    price: product?.prices?.cash?.toString(),
  });
  useProductSchema(product);
  useBreadcrumbSchema(
    product
      ? [
          {
            name: "Inicio",
            url: typeof window !== "undefined" ? window.location.origin : "",
          },
          {
            name: product.category?.name || "Accesorios",
            url: typeof window !== "undefined" ? window.location.origin : "",
          },
          {
            name: product.name,
            url: typeof window !== "undefined" ? window.location.href : "",
          },
        ]
      : null,
  );
  const [error, setError] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [activeMedia, setActiveMedia] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Usamos el endpoint específico por ID
        const { data: found } = await axiosClient.get(`/products/${id}`);

        if (found) {
          setProduct(found);

          const media = [];

          // Fotos
          found.images?.forEach((img) => {
            media.push({ type: "image", url: img.url, id: img._id || img.url });
          });

          // Video
          if (found.videoUrl) {
            const ytId = getYouTubeId(found.videoUrl);
            const tkId = getTikTokId(found.videoUrl);
            if (ytId) {
              media.push({
                type: "video_youtube",
                url: `https://www.youtube.com/embed/${ytId}`,
                thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
                id: "video-item",
              });
            } else if (tkId) {
              media.push({
                type: "video_tiktok",
                url: `https://www.tiktok.com/embed/v2/${tkId}`,
                thumbnail:
                  "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
                id: "video-item",
              });
            }
          }

          setMediaList(media);
          if (media.length > 0) setActiveMedia(media[0]);
          trackViewProduct(found);
        } else {
          setError("Producto no encontrado");
        }
      } catch {
        setError("Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleWhatsApp = () => {
    if (!product) return;
    const phone = "5493816312804";
    const message = `Hola Margarita, quería consultar por: *${product.name}* (SKU: ${product.sku}).`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  if (loading)
    return (
      <div className="min-h-screen bg-cin-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-cin-600 border-t-transparent" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-cin-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    );

  const hasOffer = product.prices?.hasOffer;

  return (
    <div className="min-h-screen bg-cin-50 flex flex-col font-sans">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Volver */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-cin-500 hover:text-cin-700 mb-6 text-sm font-medium transition-colors"
        >
          <FaArrowLeft size={11} /> Volver al catálogo
        </Link>

        <div className="bg-white rounded-2xl border border-cin-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* ── GALERÍA ── */}
            <div className="lg:col-span-7 p-6 md:p-8 flex flex-col gap-4">
              {/* Visor principal */}
              <div className="relative w-full aspect-square md:aspect-[4/3] bg-cin-100 rounded-xl overflow-hidden flex items-center justify-center">
                {/* Badge oferta */}
                {hasOffer && (
                  <div className="absolute top-3 left-3 z-10 bg-cin-600 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    <FaTag size={10} />
                    {Math.round(
                      (1 - product.prices.cash / product.prices.base) * 100,
                    )}
                    % OFF
                  </div>
                )}

                {/* Badge destacado */}
                {product.isFeatured && (
                  <div className="absolute top-3 right-3 z-10 bg-gold text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    <FaStar size={10} /> Destacado
                  </div>
                )}

                {!activeMedia ? (
                  <div className="w-full h-full bg-cin-100 flex items-center justify-center">
                    <FaShoppingBag className="text-cin-300" size={48} />
                  </div>
                ) : activeMedia.type === "image" ? (
                  <img
                    src={activeMedia.url}
                    alt={product.name}
                    className="w-full h-full object-contain p-2 bg-white"
                  />
                ) : (
                  <iframe
                    src={activeMedia.url}
                    title="Video producto"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>

              {/* Miniaturas */}
              {mediaList.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1 justify-start">
                  {mediaList.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveMedia(item)}
                      className={`relative shrink-0 h-18 w-18 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        activeMedia?.id === item.id
                          ? "border-cin-600 shadow-sm"
                          : "border-cin-200 opacity-60 hover:opacity-100 hover:border-cin-300"
                      }`}
                      style={{ width: 72, height: 72 }}
                    >
                      <img
                        src={
                          item.type.includes("video")
                            ? item.thumbnail
                            : item.url
                        }
                        alt=""
                        className={`w-full h-full ${item.type === "video_tiktok" ? "object-contain p-1 bg-black" : "object-cover"}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "";
                        }}
                      />
                      {item.type.includes("video") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-colors">
                          <div
                            className={`text-white rounded-full p-1.5 ${item.type === "video_tiktok" ? "bg-black" : "bg-red-600"}`}
                          >
                            <FaPlay size={8} className="ml-0.5" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── INFO ── */}
            <div className="lg:col-span-5 p-6 md:p-8 bg-cin-50/50 border-t lg:border-t-0 lg:border-l border-cin-100 flex flex-col">
              {/* Categoría + nombre */}
              <div className="mb-5">
                <span className="inline-block bg-cin-200 text-cin-700 text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wide mb-3">
                  {product.category?.name || "Accesorios"}
                </span>
                <h1 className="font-display text-2xl md:text-3xl text-cin-900 leading-snug mb-2">
                  {product.name}
                </h1>
                <p className="text-cin-400 text-xs font-mono">
                  SKU: {product.sku}
                </p>
              </div>

              {/* Card de precios */}
              <div className="bg-white rounded-xl border border-cin-200 p-5 mb-5">
                {/* Precio */}
                <div className="mb-4 pb-4 border-b border-cin-100">
                  {product.prices?.list > product.prices?.cash && (
                    <p className="text-cin-400 text-sm mb-1 flex items-center gap-2">
                      {hasOffer ? "Precio normal:" : "Precio lista:"}
                      <span className="line-through text-cin-300">
                        {formatPrice(product.prices.list)}
                      </span>
                    </p>
                  )}
                  <div className="flex flex-col">
                    <span className="font-display text-4xl font-semibold text-cin-800">
                      {formatPrice(product.prices.cash)}
                    </span>
                    <span
                      className={`text-xs font-medium w-fit px-2 py-0.5 rounded mt-1.5 ${
                        hasOffer
                          ? "bg-cin-100 text-cin-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {hasOffer
                        ? "Precio de oferta"
                        : "Precio contado / transferencia"}
                    </span>
                  </div>
                </div>

                {/* Financiación */}
                {product.prices?.financing?.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-cin-400 uppercase tracking-widest mb-2">
                      Financiación
                    </p>
                    {product.prices.financing.map((plan, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-sm p-3 bg-cin-50 rounded-lg border border-cin-100 hover:border-cin-300 transition-colors"
                      >
                        <span className="font-medium text-cin-700">
                          {plan.planName}
                        </span>
                        <span className="font-display font-semibold text-cin-600">
                          {plan.installments}x{" "}
                          {formatPrice(plan.installmentValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-cin-400 italic">
                    Consultá planes de pago por WhatsApp.
                  </p>
                )}
              </div>

              {/* Botones */}
              <div className="flex flex-col gap-3 mb-6">
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-cin-700 hover:bg-cin-800 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-3 text-base shadow-sm"
                >
                  <FaShoppingBag size={18} /> Agregar al carrito
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-white border border-green-300 text-green-700 hover:bg-green-50 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <FaWhatsapp size={18} /> Consultar por este producto
                </button>
              </div>

              {/* Descripción */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="font-display text-base text-cin-800 mb-2">
                    Descripción
                  </h3>
                  <p className="text-cin-600 text-sm leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Garantías */}
              <div className="mt-auto grid grid-cols-2 gap-3 border-t border-cin-100 pt-5">
                <div className="flex items-center gap-2 text-xs text-cin-500">
                  <FaTruck className="text-cin-400 shrink-0" size={14} /> Envío
                  a domicilio
                </div>
                <div className="flex items-center gap-2 text-xs text-cin-500">
                  <FaShieldAlt className="text-cin-400 shrink-0" size={14} />{" "}
                  Garantía por escrito
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRODUCTOS RELACIONADOS ── */}
      {product && (
        <RelatedProducts
          categoryId={product.category?._id}
          currentId={product._id}
        />
      )}

      {/* WhatsApp flotante */}
      <a
        href="https://wa.me/5493816312804"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
      >
        <FaWhatsapp size={26} />
      </a>

      <Footer />
    </div>
  );
};

export default ProductDetail;
