import axios from "axios";
import crypto from "crypto";
import { config } from "../../config/env.js";
import { ApiError } from "../../utils/apiError.js";

const IME_BASE = "https://staging.imepay.com.np";
const client = axios.create({ timeout: 15000 });

export const initiateImepay = async (user, order) => {
  if (!config.imepay.merchantCode || !config.imepay.secretKey) {
    throw new ApiError("IME Pay credentials not configured", 500);
  }
  const transactionId = `IME-${Date.now()}`;
  const amount = Math.round(order.total).toString();
  const message = `${config.imepay.merchantCode}${transactionId}${amount}`;
  const signature = crypto.createHmac("sha256", config.imepay.secretKey).update(message).digest("hex");

  const payload = {
    merchantCode: config.imepay.merchantCode,
    transactionId,
    amount,
    message,
    signature,
    returnUrl: `${config.clientUrl}/checkout/verify?provider=imepay`,
    failureUrl: `${config.clientUrl}/checkout/verify?provider=imepay`,
  };

  return { paymentUrl: `${IME_BASE}/api/Web/`, transactionId };
};

export const verifyImepay = async (transactionId) => {
  const response = await client.get(`${IME_BASE}/api/Web/Transaction/Status`, { params: { merchantCode: config.imepay.merchantCode, transactionId } });
  return response.data?.status === "success" || response.data?.status === "Success";
};
