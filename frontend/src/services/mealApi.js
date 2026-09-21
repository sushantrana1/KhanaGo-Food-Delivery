import api from "./api.js";

export const getMeals = (page = 1, limit = 20) => api.get(`/meals?page=${page}&limit=${limit}`);
export const searchMeals = (q) => api.get(`/meals/search?q=${encodeURIComponent(q)}`);
export const getMealById = (id) => api.get(`/meals/${id}`);
export const getRandomMeals = (count = 8) => api.get(`/meals/random?count=${count}`);
export const getCategories = () => api.get("/meals/categories");
export const getMealsByCategory = (category) => api.get(`/meals/category/${category}`);
export const getMealsByArea = (area) => api.get(`/meals/area/${area}`);
export const getMealsByIngredient = (ingredient) => api.get(`/meals/ingredient/${ingredient}`);
export const getCategoryList = () => api.get("/meals/categories/list");
export const getAreaList = () => api.get("/meals/areas/list");
export const getIngredientList = () => api.get("/meals/ingredients/list");
