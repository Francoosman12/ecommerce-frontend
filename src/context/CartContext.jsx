import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { formatPrice } from "../utils/formatPrice";
import { useNavigate } from "react-router-dom";
import { trackAddToCart } from "../hooks/useAnalytics";

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
      trackAddToCart(product, 1);
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
    toast.error("Producto eliminado");
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    setCartItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, qty: newQty } : item)),
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.prices.cash * item.qty,
    0,
  );

  const sendOrder = () => {
    if (cartItems.length === 0) return;
    const phone = "5493816312804";
    let message =
      "Hola *Margarita*, quisiera consultar por el siguiente pedido: \n\n";
    cartItems.forEach((item) => {
      message += `▪️ *${item.name}* (x${item.qty})\n`;
      message += `   SKU: ${item.sku}\n`;
      message += `   Subtotal: ${formatPrice(item.prices.cash * item.qty)}\n\n`;
    });
    message += `*TOTAL ESTIMADO: ${formatPrice(totalAmount)}*\n\n`;
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
