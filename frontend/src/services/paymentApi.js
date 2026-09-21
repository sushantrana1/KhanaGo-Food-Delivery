import api from "./api.js";

export const initiatePayment = (orderId, provider) => api.post("/payments/initiate", { orderId, provider });
export const verifyKhalti = (transactionId) => api.post("/payments/khalti/verify", { transactionId });
export const verifyEsewa = (transactionId) => api.post("/payments/esewa/verify", { transactionId });
export const verifyImepay = (transactionId) => api.post("/payments/imepay/verify", { transactionId });
