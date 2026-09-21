import api from "./api.js";

export const getDashboardStats = () => api.get("/admin/dashboard");
export const getUsers = (params) => api.get("/admin/users", { params });
export const updateUser = (id, data) => api.patch(`/admin/users/${id}`, data);
export const getAdminOrders = (params) => api.get("/admin/orders", { params });
export const updateOrderStatus = (id, status) => api.patch(`/admin/orders/${id}/status`, { status });
export const getAdminMeals = () => api.get("/admin/meals");
export const updateAdminMeal = (mealId, data) => api.patch(`/admin/meals/${mealId}`, data);
export const getAdminDeals = () => api.get("/admin/deals");
export const createAdminDeal = (data) => api.post("/admin/deals", data);
export const updateAdminDeal = (id, data) => api.patch(`/admin/deals/${id}`, data);
export const deleteAdminDeal = (id) => api.delete(`/admin/deals/${id}`);
