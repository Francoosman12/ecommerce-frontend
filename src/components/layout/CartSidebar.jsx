import React from "react";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatPrice";
import {
  FaTimes,
  FaTrash,
  FaWhatsapp,
  FaMinus,
  FaPlus,
  FaShoppingBag,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CartSidebar = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    totalAmount,
    sendOrder,
  } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        className="absolute inset-0 bg-cin-950/60 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      <aside className="relative w-full max-w-md bg-cin-50 h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="px-5 py-4 border-b border-cin-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <FaShoppingBag className="text-cin-600" size={18} />
            <h2 className="font-display text-lg text-cin-800">Tu carrito</h2>
            <span className="text-xs bg-cin-600 text-white px-2 py-0.5 rounded-full font-medium">
              {cartItems.length}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-cin-400 hover:text-cin-700 p-1.5 rounded-lg hover:bg-cin-100 transition-colors"
          >
            <FaTimes size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-20 h-20 bg-cin-100 rounded-full flex items-center justify-center mb-4">
                <FaShoppingBag className="text-cin-300" size={28} />
              </div>
              <p className="font-display text-lg text-cin-700 mb-1">
                Tu carrito está vacío
              </p>
              <p className="text-sm text-cin-400">
                Agregá productos para comenzar
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item._id}
                className="flex gap-3 p-3 bg-white rounded-xl border border-cin-100 hover:border-cin-200 transition-colors"
              >
                <div
                  className="shrink-0 rounded-lg overflow-hidden border border-cin-100 bg-cin-50"
                  style={{ width: 72, height: 72 }}
                >
                  {item.images?.[0]?.url ? (
                    <img
                      src={item.images[0].url}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full bg-cin-100" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h4 className="font-medium text-cin-800 text-sm line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-cin-400 mt-0.5">
                      {item.category?.name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-display font-semibold text-cin-700 text-sm">
                      {formatPrice(item.prices.cash)}
                    </span>
                    <div className="flex items-center gap-2 bg-cin-50 rounded-lg px-2 py-1 border border-cin-200">
                      <button
                        onClick={() => updateQuantity(item._id, item.qty - 1)}
                        className="text-cin-500 hover:text-cin-700"
                      >
                        <FaMinus size={9} />
                      </button>
                      <span className="text-xs font-bold text-cin-800 w-4 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.qty + 1)}
                        className="text-cin-500 hover:text-cin-700"
                      >
                        <FaPlus size={9} />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-cin-300 hover:text-red-400 self-start p-1 transition-colors shrink-0"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-4 border-t border-cin-200 bg-white space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-cin-600 text-sm font-medium">
                Total estimado
              </span>
              <span className="font-display text-2xl text-cin-800 font-semibold">
                {formatPrice(totalAmount)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-cin-700 hover:bg-cin-800 text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              <FaShoppingBag size={15} /> Finalizar compra
            </button>
            <button
              onClick={sendOrder}
              className="w-full bg-white border border-green-300 text-green-700 hover:bg-green-50 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <FaWhatsapp size={16} /> Solo consultar por WhatsApp
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartSidebar;
