import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import useSEO from "../../hooks/useSEO";
import {
  FaWhatsapp,
  FaInstagram,
  FaHeart,
  FaLeaf,
  FaStar,
} from "react-icons/fa";

const MargaritaFlower = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <g transform="translate(50,50)">
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy="-28"
          rx="9"
          ry="18"
          fill="#f6dbd6"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="13" fill="#D4A843" />
    </g>
  </svg>
);

const AboutUs = () => {
  useSEO({
    title: "Quiénes somos — Margarita Accesorios",
    description:
      "Conocé la historia de Margarita Accesorios. Bufandones artesanales y accesorios de moda femenina en San Miguel de Tucumán.",
  });

  const valores = [
    {
      icon: <FaHeart className="text-cin-600" size={20} />,
      title: "Hecho con amor",
      desc: "Cada bufandón pasa por nuestras manos antes de llegar a las tuyas. Cuidamos cada detalle.",
    },
    {
      icon: <FaLeaf className="text-cin-600" size={20} />,
      title: "Materiales seleccionados",
      desc: "Trabajamos con lanas y telas de calidad, elegidas por su suavidad, durabilidad y color.",
    },
    {
      icon: <FaStar className="text-cin-600" size={20} />,
      title: "Diseños únicos",
      desc: "No hacemos series masivas. Cada colección es limitada para que tu accesorio sea especial.",
    },
  ];

  return (
    <div className="min-h-screen bg-cin-50 flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="bg-cin-200 py-16 md:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10 max-w-4xl">
          <div className="flex-1 text-center md:text-left">
            <p className="text-cin-600 text-xs font-medium tracking-widest uppercase mb-3">
              Nuestra historia
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-cin-900 leading-tight mb-4">
              Somos <em className="text-cin-600 not-italic">Margarita</em>
            </h1>
            <p className="text-cin-700 text-base leading-relaxed max-w-md mx-auto md:mx-0">
              Nacimos en Tucumán con una idea simple: crear accesorios que
              combinen calidez, estilo y artesanía local.
            </p>
          </div>
          <div className="shrink-0 opacity-80">
            <MargaritaFlower size={140} />
          </div>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <div className="bg-white rounded-2xl border border-cin-200 p-8 md:p-10">
          <h2 className="font-display text-2xl text-cin-800 mb-5">
            ¿De dónde venimos?
          </h2>
          <div className="space-y-4 text-cin-600 text-sm leading-relaxed">
            <p>
              Margarita Accesorios nació de la pasión por la moda femenina y el
              trabajo artesanal. Lo que empezó como un proyecto personal se
              convirtió en una marca que hoy viste a cientos de mujeres en toda
              Argentina.
            </p>
            <p>
              Nos especializamos en bufandones — esa prenda que en invierno se
              convierte en la protagonista del outfit. Los hacemos en colores
              únicos, con materiales que duran y se sienten bien en la piel.
            </p>
            <p>
              Cada pieza que creamos lleva tiempo, cuidado y un criterio
              estético que nos define. No seguimos tendencias masivas — creamos
              las nuestras.
            </p>
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="container mx-auto px-4 pb-14 max-w-3xl">
        <h2 className="font-display text-2xl text-cin-800 mb-6 text-center">
          Lo que nos define
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {valores.map((v, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-cin-200 p-6 text-center"
            >
              <div className="w-12 h-12 bg-cin-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {v.icon}
              </div>
              <h3 className="font-display text-base text-cin-800 mb-2">
                {v.title}
              </h3>
              <p className="text-cin-500 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="container mx-auto px-4 pb-14 max-w-3xl">
        <h2 className="font-display text-2xl text-cin-800 mb-2 text-center">
          Lo que dicen nuestras clientas
        </h2>
        <p className="text-cin-500 text-sm text-center mb-8">
          Opiniones reales de quienes ya compraron
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: "María L.",
              city: "Tucumán",
              text: "Me llegó súper rápido y la calidad es increíble. El bufandón es exactamente como en las fotos, muy abrigado y suave.",
              stars: 5,
            },
            {
              name: "Valentina G.",
              city: "Buenos Aires",
              text: "Compré dos bufandones y quedé enamorada. Los colores son únicos, no los encontrás en ningún lado. Ya quiero el próximo.",
              stars: 5,
            },
            {
              name: "Sofía R.",
              city: "Córdoba",
              text: "Atención excelente por WhatsApp y el producto superó mis expectativas. 100% recomendable, ya le conté a todas mis amigas.",
              stars: 5,
            },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-cin-200 p-6"
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.stars)].map((_, s) => (
                  <svg
                    key={s}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="#D4A843"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-cin-600 text-sm leading-relaxed mb-4">
                "{t.text}"
              </p>
              <div>
                <p className="font-medium text-cin-800 text-sm">{t.name}</p>
                <p className="text-cin-400 text-xs">{t.city}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-16 max-w-3xl">
        <div className="bg-cin-800 rounded-2xl p-8 md:p-10 text-center">
          <h2 className="font-display text-2xl text-cin-100 mb-3">
            ¿Querés conocer más?
          </h2>
          <p className="text-cin-400 text-sm mb-6">
            Seguinos en Instagram o escribinos por WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://www.instagram.com/margarita_accesorios.11"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-cin-600 hover:bg-cin-500 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
            >
              <FaInstagram size={16} /> Seguinos en Instagram
            </a>
            <a
              href="https://wa.me/5493816312804"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-cin-100 font-medium px-6 py-3 rounded-xl transition-colors text-sm border border-white/20"
            >
              <FaWhatsapp size={16} /> Escribinos
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
