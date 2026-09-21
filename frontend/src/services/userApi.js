import api from "./api.js";

export const getProfile = () => api.get("/users/profile");
export const updateProfile = (data) => api.patch("/users/profile", data);
export const addAddress = (data) => api.post("/users/addresses", data);
export const updateAddress = (id, data) => api.put(`/users/addresses/${id}`, data);
export const deleteAddress = (id) => api.delete(`/users/addresses/${id}`);
