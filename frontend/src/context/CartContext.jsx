import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api.js";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      let local;
      try {
        local = JSON.parse(localStorage.getItem("guest_cart") || "{\"items\":[]}");
      } catch {
        local = { items: [] };
      }
      setCart(local);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/cart");
      setCart(res.data.cart);
    } catch {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    const handleLogin = async () => {
      let guestCart;
      try {
        guestCart = JSON.parse(localStorage.getItem("guest_cart") || '{"items":[]}');
      } catch {
        guestCart = { items: [] };
      }
      if (guestCart.items && guestCart.items.length > 0) {
        for (const item of guestCart.items) {
          await api.post("/cart", item);
        }
        localStorage.removeItem("guest_cart");
      }
      await fetchCart();
    };
    window.addEventListener("user-login", handleLogin);
    return () => window.removeEventListener("user-login", handleLogin);
  }, []);

  const addToCart = async (item) => {
    const token = localStorage.getItem("token");
    if (!token) {
      let local;
      try {
        local = JSON.parse(localStorage.getItem("guest_cart") || "{\"items\":[]}");
      } catch {
        local = { items: [] };
      }
      const idx = local.items.findIndex((i) => i.mealId === item.mealId);
      if (idx >= 0) local.items[idx].quantity += item.quantity || 1;
      else local.items.push({ ...item, quantity: item.quantity || 1 });
      localStorage.setItem("guest_cart", JSON.stringify(local));
      setCart(local);
      return;
    }
    const res = await api.post("/cart", item);
    setCart(res.data.cart);
  };

  const updateCartItem = async (mealId, quantity) => {
    const token = localStorage.getItem("token");
    if (!token) {
      let local;
      try {
        local = JSON.parse(localStorage.getItem("guest_cart") || "{\"items\":[]}");
      } catch {
        local = { items: [] };
      }
      const idx = local.items.findIndex((i) => i.mealId === mealId);
      if (idx >= 0) {
        if (quantity <= 0) local.items.splice(idx, 1);
        else local.items[idx].quantity = quantity;
      }
      localStorage.setItem("guest_cart", JSON.stringify(local));
      setCart(local);
      return;
    }
    const res = await api.put(`/cart/${mealId}`, { quantity });
    setCart(res.data.cart);
  };

  const removeFromCart = async (mealId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      let local;
      try {
        local = JSON.parse(localStorage.getItem("guest_cart") || "{\"items\":[]}");
      } catch {
        local = { items: [] };
      }
      local.items = local.items.filter((i) => i.mealId !== mealId);
      localStorage.setItem("guest_cart", JSON.stringify(local));
      setCart(local);
      return;
    }
    const res = await api.delete(`/cart/${mealId}`);
    setCart(res.data.cart);
  };

  const clearCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("guest_cart");
      setCart({ items: [] });
      return;
    }
    const res = await api.delete("/cart");
    setCart(res.data.cart);
  };

  const itemCount = cart.items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const deliveryFee = subtotal > 0 ? 100 : 0;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + deliveryFee + tax;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateCartItem, removeFromCart, clearCart, itemCount, subtotal, deliveryFee, tax, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
