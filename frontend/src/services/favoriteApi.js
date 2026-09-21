import api from "./api.js";

export const getFavorites = () => api.get("/favorites");
export const addFavorite = (mealId, data) => api.post(`/favorites/${mealId}`, data);
export const removeFavorite = (mealId) => api.delete(`/favorites/${mealId}`);
