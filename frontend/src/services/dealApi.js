import api from "./api.js";

export const getDeals = () => api.get("/deals");
export const getDealById = (id) => api.get(`/deals/${id}`);
export const claimDeal = (id, data) => api.post(`/deals/${id}/claim`, data);
export const getAllDealsAdmin = () => api.get("/deals/all");
export const createDeal = (data) => api.post("/deals", data);
export const updateDeal = (id, data) => api.put(`/deals/${id}`, data);
export const deleteDeal = (id) => api.delete(`/deals/${id}`);
