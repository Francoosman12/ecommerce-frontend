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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Panel */}
      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🛒 Tu Carrito
            <span className="text-sm bg-indigo-600 text-white px-2 py-0.5 rounded-full">
              {cartItems.length}
            </span>
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center opacity-70">
              <span className="text-6xl mb-4">🛍️</span>
              <p className="text-lg font-medium">El carrito está vacío</p>
              <p className="text-sm">Agrega productos para comprar.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item._id}
                className="flex gap-4 p-3 border border-gray-100 rounded-xl hover:border-indigo-100 transition-colors bg-white shadow-sm"
              >
                <div className="h-20 w-20 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={item.images?.[0]?.url || "/placeholder.jpg"}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-1">
                      {item.category?.name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600 text-sm">
                      {formatPrice(item.prices.cash)} c/u
                    </span>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item._id, item.qty - 1)}
                        className="text-gray-500 hover:text-indigo-600"
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="text-xs font-bold text-gray-800 w-4 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.qty + 1)}
                        className="text-gray-500 hover:text-indigo-600"
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-gray-300 hover:text-red-500 self-start p-1 transition-colors"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total Estimado</span>
              <span className="text-2xl font-black text-gray-900">
                {formatPrice(totalAmount)}
              </span>
            </div>

            {/* Botón principal: Ir al Checkout */}
            <button
              onClick={handleCheckout}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <FaShoppingBag size={18} /> Finalizar compra
            </button>

            {/* Botón secundario: WhatsApp (flujo anterior) */}
            <button
              onClick={sendOrder}
              className="w-full bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <FaWhatsapp size={18} /> Solo consultar por WhatsApp
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartSidebar;
