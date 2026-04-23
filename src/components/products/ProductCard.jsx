import React from "react";
import { formatPrice } from "../../utils/formatPrice";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { FaShoppingBag } from "react-icons/fa";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  let imageUrl = product.images?.[0]?.url || null;
  if (imageUrl?.includes("cloudinary.com")) {
    // w_300 es suficiente para cards — ahorra ~40% de peso
    imageUrl = imageUrl.replace(
      "/upload/",
      "/upload/f_auto,q_auto,w_300,h_300,c_limit/",
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-cin-100 group">
      {/* IMAGEN */}
      <div className="relative h-52 overflow-hidden bg-cin-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            loading="lazy"
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="64" height="64" viewBox="0 0 100 100" opacity="0.3">
              <g transform="translate(50,50)">
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
                  (deg) => (
                    <ellipse
                      key={deg}
                      cx="0"
                      cy="-28"
                      rx="9"
                      ry="18"
                      fill="#bd5845"
                      transform={`rotate(${deg})`}
                    />
                  ),
                )}
                <circle cx="0" cy="0" r="12" fill="#D4A843" />
              </g>
            </svg>
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="bg-gold text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
              Destacado
            </span>
          )}
          {product.prices?.list > product.prices?.cash && (
            <span className="bg-cin-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
              Oferta
            </span>
          )}
        </div>
      </div>

      {/* INFO */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-cin-500 text-xs font-medium uppercase tracking-wide mb-1">
            {product.category?.name || "Accesorios"}
          </p>
          <h3 className="font-display text-base text-cin-900 leading-snug line-clamp-2 mb-3">
            {product.name}
          </h3>
        </div>

        <div className="space-y-0.5">
          {product.prices?.list > product.prices?.cash && (
            <p className="text-xs text-cin-400 line-through">
              {formatPrice(product.prices.list)}
            </p>
          )}
          <p className="text-xl font-display font-semibold text-cin-700">
            {formatPrice(product.prices?.cash)}
          </p>
          {product.prices?.financing?.length > 0 &&
            (() => {
              const maxPlan = product.prices.financing.reduce((prev, curr) =>
                prev.installments > curr.installments ? prev : curr,
              );
              return (
                <p className="text-xs text-cin-500">
                  <span className="font-medium text-cin-600">
                    {maxPlan.installments} cuotas
                  </span>{" "}
                  de {formatPrice(maxPlan.installmentValue)}
                </p>
              );
            })()}
        </div>
      </div>

      {/* BOTONES */}
      <div className="px-4 pb-4 flex gap-2">
        <Link
          to={`/product/${product._id}`}
          className="flex-1 border border-cin-300 text-cin-700 hover:bg-cin-100 font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center text-sm"
        >
          Ver detalle
        </Link>
        <button
          onClick={() => addToCart(product)}
          className="flex-1 bg-cin-600 hover:bg-cin-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm"
        >
          <FaShoppingBag size={13} /> Agregar
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
