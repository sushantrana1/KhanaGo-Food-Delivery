import axios from "axios";
import crypto from "crypto";
import { config } from "../../config/env.js";
import { ApiError } from "../../utils/apiError.js";

const ESEWA_BASE = "https://rc.esewa.com.np";
const client = axios.create({ timeout: 15000 });

export const initiateEsewa = async (user, order) => {
  if (!config.esewa.merchantId || !config.esewa.secretKey) {
    throw new ApiError("eSewa credentials not configured", 500);
  }
  const transactionId = `ESW-${Date.now()}`;
  const amount = order.total.toFixed(2);
  const tax = order.tax.toFixed(2);
  const total = order.total.toFixed(2);
  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const signedFieldValues = `${total},${transactionId},${config.esewa.merchantId}`;
  const signature = crypto.createHmac("sha256", config.esewa.secretKey).update(signedFieldValues).digest("base64");

  const form = new URLSearchParams();
  form.append("amount", amount);
  form.append("tax", tax);
  form.append("total", total);
  form.append("transaction_uuid", transactionId);
  form.append("product_code", config.esewa.merchantId);
  form.append("product_service_charge", "0");
  form.append("product_delivery_charge", "0");
  form.append("success_url", `${config.clientUrl}/checkout/verify?provider=esewa`);
  form.append("failure_url", `${config.clientUrl}/checkout/verify?provider=esewa`);
  form.append("signed_field_names", signedFieldNames);
  form.append("signature", signature);

  return { paymentUrl: `${ESEWA_BASE}/wms/order/`, transactionId };
};

export const verifyEsewa = async (transactionId) => {
  const response = await client.get(`${ESEWA_BASE}/wms/order/status/`, { params: { transaction_uuid: transactionId } });
  return response.data?.status === "COMPLETED";
};
