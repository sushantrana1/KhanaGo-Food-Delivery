import axios from "axios";
import { config } from "../../config/env.js";
import { ApiError } from "../../utils/apiError.js";

const KHALTI_BASE = "https://khalti.com/api/v2";
const client = axios.create({ timeout: 15000 });

export const initiateKhalti = async (user, order) => {
  if (!config.khalti.publicKey || !config.khalti.secretKey) {
    throw new ApiError("Khalti credentials not configured", 500);
  }

  const payload = {
    return_url: `${config.clientUrl}/checkout/verify?provider=khalti`,
    website_url: config.clientUrl,
    amount: Math.round(order.total * 100),
    purchase_order_id: order._id.toString(),
    purchase_order_name: `Order ${order._id}`,
    customer_info: {
      name: user.name,
      email: user.email,
      phone: user.phone || "9800000000",
    },
  };

  const response = await client.post(
    `${KHALTI_BASE}/epayment/initiate/`,
    payload,
    {
      headers: { Authorization: `Key ${config.khalti.secretKey}` },
    }
  );

  return {
    paymentUrl:
      response.data?.payment_url || response.data?.paymentUrl,
    transactionId:
      response.data?.pidx || response.data?.transactionId,
  };
};

export const verifyKhalti = async (pidx) => {
  if (!config.khalti.secretKey)
    throw new Error("Khalti credentials not configured");

  const response = await client.post(
    `${KHALTI_BASE}/epayment/lookup/`,
    { pidx },
    { headers: { Authorization: `Key ${config.khalti.secretKey}` } }
  );

  const status = response.data?.status?.toLowerCase();
  // Only mark as paid when actually paid
  return ["completed", "charged"].includes(status);
};