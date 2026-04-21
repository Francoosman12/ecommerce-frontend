import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ProductCard from "../../components/products/ProductCard";
import { useProducts } from "../../hooks/useProducts";
import { FaFilter, FaSearch, FaArrowDown, FaWhatsapp } from "react-icons/fa";
import { useSearch } from "../../context/SearchContext";

// Logo SVG inline para el Hero
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
  const { products, loading: productsLoading, error } = useProducts(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const { searchTerm, setSearchTerm } = useSearch();
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await axiosClient.get("/categories");
        setCategories(data);
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

  return (
    <div className="flex flex-col min-h-screen bg-cin-50 font-sans">
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-cin-200 overflow-hidden">
        <div className="container mx-auto px-4 py-14 md:py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <p className="text-cin-600 text-xs font-medium tracking-widest uppercase mb-3">
              Nueva colección · Otoño Invierno
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-cin-900 leading-tight mb-4">
              Bufandones que
              <br />
              <em className="text-cin-600 not-italic">te abrazan</em>
            </h1>
            <p className="text-cin-700 text-base leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
              Lana seleccionada, colores únicos y diseños artesanales para la
              mujer que sabe lo que quiere.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button
                onClick={() =>
                  document
                    .getElementById("catalogo")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="bg-cin-700 hover:bg-cin-800 text-cin-50 font-medium px-8 py-3.5 rounded-xl transition-colors shadow-sm"
              >
                Ver colección
              </button>
              <a
                href="https://wa.me/5493815225633"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white border border-cin-300 text-cin-700 hover:bg-cin-100 font-medium px-8 py-3.5 rounded-xl transition-colors"
              >
                <FaWhatsapp className="text-green-500" size={16} />
                Consultar
              </a>
            </div>
          </div>

          {/* Flor decorativa */}
          <div className="shrink-0 opacity-80">
            <div className="animate-float">
              <MargaritaFlower size={160} />
            </div>
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

      {/* ── CATÁLOGO ── */}
      <section id="catalogo" className="container mx-auto px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-cin-800">
            Catálogo completo
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR FILTROS */}
          <aside className="w-full lg:w-56 shrink-0 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-cin-200">
              <h3 className="font-medium text-cin-700 mb-3 flex items-center gap-2 text-sm">
                <FaSearch className="text-cin-400" size={12} /> Buscar
              </h3>
              <input
                type="text"
                placeholder="Bufandón, accesorio..."
                className="w-full bg-cin-50 border border-cin-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-cin-300 focus:border-cin-400 outline-none transition-all text-cin-800 placeholder-cin-400"
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
                  className={`px-3 py-2 rounded-lg text-sm text-left transition-colors whitespace-nowrap ${
                    selectedCategory === "TODOS"
                      ? "bg-cin-600 text-white font-medium shadow-sm"
                      : "text-cin-600 hover:bg-cin-100"
                  }`}
                >
                  Ver Todo
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`px-3 py-2 rounded-lg text-sm text-left transition-colors whitespace-nowrap ${
                      selectedCategory === cat._id
                        ? "bg-cin-600 text-white font-medium shadow-sm"
                        : "text-cin-600 hover:bg-cin-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* GRILLA */}
          <main className="flex-1">
            {productsLoading && (
              <div className="flex justify-center p-20">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-cin-600 border-t-transparent" />
              </div>
            )}

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
                    <div className="text-cin-300 text-5xl mb-4 block mx-auto w-fit">
                      <FaSearch />
                    </div>
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

      {/* WHATSAPP FLOTANTE */}
      <a
        href="https://wa.me/5493815225633"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        title="Consultar por WhatsApp"
      >
        <FaWhatsapp size={26} />
      </a>

      <Footer />
    </div>
  );
};

export default Home;
