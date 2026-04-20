import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { formatPrice } from "../utils/formatPrice";
import { useNavigate } from "react-router-dom";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ─── Agregar producto ──────────────────────────────────────────────────
  const addToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        toast.info("Se actualizó la cantidad en el carrito");
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      toast.success("Agregado al carrito 🛒");
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  // ─── Quitar producto ───────────────────────────────────────────────────
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
    toast.error("Producto eliminado");
  };

  // ─── Cambiar cantidad ──────────────────────────────────────────────────
  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    setCartItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, qty: newQty } : item)),
    );
  };

  // ─── Vaciar carrito ────────────────────────────────────────────────────
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  // ─── Total ─────────────────────────────────────────────────────────────
  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.prices.cash * item.qty,
    0,
  );

  // ─── Envío por WhatsApp (flujo anterior — se mantiene) ────────────────
  const sendOrder = () => {
    if (cartItems.length === 0) return;
    const phone = "5493815225633";
    let message =
      "Hola *Casa Bahia*, quisiera consultar por el siguiente pedido web: \n\n";
    cartItems.forEach((item) => {
      message += `▪️ *${item.name}* (x${item.qty})\n`;
      message += `   SKU: ${item.sku}\n`;
      message += `   Subtotal: ${formatPrice(item.prices.cash * item.qty)}\n\n`;
    });
    message += `*TOTAL ESTIMADO (Efectivo): ${formatPrice(totalAmount)}*\n\n`;
    message += "¿Tienen stock disponible?";
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        sendOrder,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
