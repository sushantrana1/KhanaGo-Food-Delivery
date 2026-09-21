import api from "./api.js";

export const getCart = () => api.get("/cart");
export const addToCart = (item) => api.post("/cart", item);
export const updateCartItem = (mealId, quantity) => api.put(`/cart/${mealId}`, { quantity });
export const removeFromCart = (mealId) => api.delete(`/cart/${mealId}`);
export const clearCart = () => api.delete("/cart");
