import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import useSEO from "../../hooks/useSEO";
import { useOrganizationSchema } from "../../hooks/useSchema";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ProductCard from "../../components/products/ProductCard";
import { SkeletonGrid } from "../../components/ui/SkeletonCard";
import { useProducts } from "../../hooks/useProducts";
import {
  FaFilter,
  FaSearch,
  FaArrowDown,
  FaWhatsapp,
  FaInstagram,
} from "react-icons/fa";
import { useSearch } from "../../context/SearchContext";

const MargaritaFlower = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <g transform="translate(50,50)">
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy="-28"
          rx="9"
          ry="18"
          fill="white"
          opacity="0.9"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="13" fill="#D4A843" />
    </g>
  </svg>
);

const Home = () => {
  useSEO({
    title: "Margarita Accesorios — Bufandones y Moda Femenina en Tucumán",
    description:
      "Descubrí nuestra colección de bufandones artesanales, accesorios y moda femenina. Diseños únicos con envíos a toda Argentina.",
    url: typeof window !== "undefined" ? window.location.href : "",
  });
  useOrganizationSchema();

  const { products, loading: productsLoading, error } = useProducts(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [reelUrl, setReelUrl] = useState(
    "https://www.instagram.com/reel/DXXsL0axcPM/",
  );
  const [followers, setFollowers] = useState("");
  const { searchTerm, setSearchTerm } = useSearch();
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const [catRes, storeRes] = await Promise.all([
          axiosClient.get("/categories"),
          axiosClient.get("/store"),
        ]);
        setCategories(catRes.data);
        if (storeRes.data?.reelUrl) setReelUrl(storeRes.data.reelUrl);
        if (storeRes.data?.instagramFollowers)
          setFollowers(storeRes.data.instagramFollowers);
      } catch {}
    };
    fetchCats();
  }, []);

  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, searchTerm]);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "TODOS" && p.category?._id !== selectedCategory)
      return false;
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
    return true;
  });

  const productsToShow = filteredProducts.slice(0, visibleCount);
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);
  const carouselProducts = products
    .filter((p) => p.images?.[0]?.url)
    .slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen bg-cin-50 font-sans">
      {/* Keyframe para el carrusel */}
      <style>{`
        @keyframes scrollUp {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .carousel-scroll {
          animation: scrollUp 9s linear infinite;
        }
        .carousel-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-cin-300 overflow-hidden relative min-h-[420px]">
        {/* Margarita gigante difuminada de fondo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="animate-float" style={{ opacity: 0.1 }}>
            <MargaritaFlower size={560} />
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Columna izquierda: texto */}
          <div>
            <p className="text-cin-700 text-xs font-medium tracking-widest uppercase mb-3">
              Nueva colección · Otoño Invierno
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-cin-900 leading-tight mb-4">
              Bufandones que
              <br />
              <em className="text-cin-600 not-italic">te abrazan</em>
            </h1>
            <p className="text-cin-800 text-base leading-relaxed mb-5 max-w-md">
              Lana seleccionada, colores únicos y diseños artesanales para la
              mujer que sabe lo que quiere.
            </p>

            <div className="flex flex-wrap gap-2 mb-7">
              {[
                { text: "Lana seleccionada", gold: false },
                { text: "Envíos a todo el país", gold: false },
                { text: "Diseño artesanal", gold: false },
                { text: "Nuevos colores", gold: true },
              ].map((pill, i) => (
                <span
                  key={i}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                    pill.gold
                      ? "bg-gold text-white border-gold"
                      : "bg-white/60 text-cin-700 border-cin-400/40"
                  }`}
                >
                  {pill.text}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() =>
                  document
                    .getElementById("catalogo")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="bg-cin-800 hover:bg-cin-900 text-cin-50 font-medium px-8 py-3.5 rounded-xl transition-colors shadow-sm"
              >
                Ver colección
              </button>
              <a
                href="https://wa.me/5493816312804"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white/70 hover:bg-white border border-white/60 text-cin-800 font-medium px-8 py-3.5 rounded-xl transition-colors"
              >
                <FaWhatsapp className="text-green-500" size={16} />
                Consultar
              </a>
            </div>
          </div>

          {/* Columna derecha: carrusel vertical */}
          <div className="hidden md:flex justify-end">
            {carouselProducts.length > 0 ? (
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{ width: 220, height: 420 }}
              >
                <div className="carousel-scroll flex flex-col gap-3">
                  {/* Duplicamos para loop infinito */}
                  {[...carouselProducts, ...carouselProducts].map((p, i) => (
                    <div
                      key={i}
                      className="shrink-0 rounded-xl overflow-hidden border-2 border-white/70 shadow-sm bg-cin-200"
                      style={{ width: 220, height: 280 }}
                    >
                      <img
                        src={p.images[0].url.replace(
                          "/upload/",
                          "/upload/f_auto,q_auto,w_300/",
                        )}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {/* Fades top y bottom */}
                <div
                  className="absolute top-0 inset-x-0 h-14 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, #edbdb4, transparent)",
                  }}
                />
                <div
                  className="absolute bottom-0 inset-x-0 h-14 pointer-events-none"
                  style={{
                    background: "linear-gradient(to top, #edbdb4, transparent)",
                  }}
                />
              </div>
            ) : (
              <div className="opacity-20">
                <MargaritaFlower size={120} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── DESTACADOS ── */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-cin-800">Destacados</h2>
            <button
              onClick={() => setSelectedCategory("TODOS")}
              className="text-sm text-cin-600 hover:text-cin-800 font-medium transition-colors"
            >
              Ver todo →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {featuredProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── INSTAGRAM ── */}
      {reelUrl && (
        <section className="bg-white border-y border-cin-200 py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-col md:flex-row items-center gap-10">
              {/* Info izquierda */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
                    <FaInstagram className="text-white" size={22} />
                  </div>
                  <div>
                    <p className="font-display text-lg text-cin-800 leading-tight">
                      margarita_accesorios.11
                    </p>
                    <p className="text-xs text-cin-400">Instagram</p>
                  </div>
                </div>

                {followers && (
                  <div className="flex gap-6 justify-center md:justify-start mb-5">
                    <div className="text-center">
                      <p className="font-display text-2xl font-semibold text-cin-800">
                        {followers}
                      </p>
                      <p className="text-xs text-cin-400 mt-0.5">seguidores</p>
                    </div>
                  </div>
                )}

                <p className="text-cin-600 text-sm leading-relaxed mb-6 max-w-xs mx-auto md:mx-0">
                  Seguinos para ver los últimos diseños, novedades y contenido
                  detrás de escena.
                </p>

                <a
                  href="https://www.instagram.com/margarita_accesorios.11"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-cin-700 hover:bg-cin-800 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
                >
                  <FaInstagram size={15} /> Seguir en Instagram
                </a>
              </div>

              {/* Reel derecha */}
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div
                  className="rounded-2xl overflow-hidden shadow-lg border-4 border-cin-100"
                  style={{ width: 200, height: 355 }}
                >
                  <iframe
                    src={`${reelUrl.replace(/\/$/, "")}/embed/`}
                    width="200"
                    height="355"
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency="true"
                    allow="encrypted-media"
                    title="Último reel de Margarita"
                    style={{ display: "block" }}
                  />
                </div>
                <p className="text-xs text-cin-400">Último reel</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CATÁLOGO ── */}
      <section id="catalogo" className="container mx-auto px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-cin-800">
            Catálogo completo
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-56 shrink-0 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-cin-200">
              <h3 className="font-medium text-cin-700 mb-3 flex items-center gap-2 text-sm">
                <FaSearch className="text-cin-400" size={12} /> Buscar
              </h3>
              <input
                type="text"
                placeholder="Bufandón, accesorio..."
                className="w-full bg-cin-50 border border-cin-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-cin-300 outline-none text-cin-800 placeholder-cin-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="bg-white p-4 rounded-xl border border-cin-200">
              <h3 className="font-medium text-cin-700 mb-3 flex items-center gap-2 text-sm">
                <FaFilter className="text-cin-400" size={12} /> Categorías
              </h3>
              <div className="flex flex-row overflow-x-auto lg:flex-col gap-2 pb-1 lg:pb-0">
                <button
                  onClick={() => setSelectedCategory("TODOS")}
                  className={`px-3 py-2 rounded-lg text-sm text-left transition-colors whitespace-nowrap ${selectedCategory === "TODOS" ? "bg-cin-600 text-white font-medium" : "text-cin-600 hover:bg-cin-100"}`}
                >
                  Ver Todo
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`px-3 py-2 rounded-lg text-sm text-left transition-colors whitespace-nowrap ${selectedCategory === cat._id ? "bg-cin-600 text-white font-medium" : "text-cin-600 hover:bg-cin-100"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {productsLoading && <SkeletonGrid count={6} />}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {!productsLoading && !error && (
              <>
                <p className="text-xs text-cin-400 mb-4">
                  Mostrando{" "}
                  <strong className="text-cin-600">
                    {productsToShow.length}
                  </strong>{" "}
                  de{" "}
                  <strong className="text-cin-600">
                    {filteredProducts.length}
                  </strong>{" "}
                  productos
                </p>
                {filteredProducts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {productsToShow.map((p) => (
                        <ProductCard key={p._id} product={p} />
                      ))}
                    </div>
                    {visibleCount < filteredProducts.length && (
                      <div className="mt-10 text-center">
                        <button
                          onClick={() => setVisibleCount((prev) => prev + 12)}
                          className="bg-white border border-cin-300 text-cin-700 font-medium px-8 py-3 rounded-xl hover:bg-cin-100 transition-colors flex items-center gap-2 mx-auto text-sm"
                        >
                          <FaArrowDown size={12} /> Cargar más productos
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-xl p-10 text-center border border-cin-200">
                    <FaSearch className="text-cin-300 text-5xl mb-4 mx-auto" />
                    <h3 className="font-display text-lg text-cin-700 mb-1">
                      Sin resultados
                    </h3>
                    <p className="text-cin-400 text-sm">
                      No encontramos productos con esos filtros.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory("TODOS");
                        setSearchTerm("");
                      }}
                      className="mt-4 text-cin-600 font-medium hover:text-cin-800 text-sm transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </section>

      {/* WhatsApp flotante */}
      <a
        href="https://wa.me/5493815225633"
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

export default Home;
