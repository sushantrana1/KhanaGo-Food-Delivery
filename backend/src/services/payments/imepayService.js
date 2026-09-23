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

  let tokenId = "";
  try {
    const response = await client.post(
      `${IME_BASE}/api/Web/GetToken`,
      {
        MerchantCode: config.imepay.merchantCode,
        Amount: amount,
        RefId: transactionId,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${config.imepay.merchantCode}:${config.imepay.secretKey}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );
    tokenId = response.data?.TokenId || response.data?.tokenId || "";
  } catch (err) {
    console.error("IME Pay token request failed:", err.message);
    throw new ApiError("Failed to initiate IME Pay", 500);
  }

  const payloadBase64 = Buffer.from(
    JSON.stringify({
      MerchantCode: config.imepay.merchantCode,
      Amount: amount,
      RefId: transactionId,
      TokenId: tokenId,
    })
  ).toString("base64");

  const signature = crypto
    .createHmac("sha256", config.imepay.secretKey)
    .update(payloadBase64)
    .digest("base64");

  const formFields = {
    MerchantCode: config.imepay.merchantCode,
    Amount: amount,
    RefId: transactionId,
    TokenId: tokenId,
    Signature: signature,
    ReturnUrl: `${config.clientUrl}/checkout/verify?provider=imepay`,
  };

  return {
    paymentUrl: `${IME_BASE}/api/Web/Transaction`,
    formFields,
    transactionId,
  };
};

export const verifyImepay = async (transactionId) => {
  try {
    const response = await client.get(
      `${IME_BASE}/api/Web/Transaction/Status`,
      {
        params: {
          merchantCode: config.imepay.merchantCode,
          transactionId,
        },
      }
    );
    const status = response.data?.status?.toLowerCase();
    return status === "success" || status === "completed";
  } catch (err) {
    console.error("IME Pay verify failed:", err.message);
    return false;
  }
};