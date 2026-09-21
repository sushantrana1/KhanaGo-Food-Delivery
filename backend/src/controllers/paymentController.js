import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import { ApiError, asyncWrapper } from "../utils/apiError.js";
import { initiateKhalti, verifyKhalti } from "../services/payments/khaltiService.js";
import { initiateEsewa, verifyEsewa } from "../services/payments/esewaService.js";
import { initiateImepay, verifyImepay } from "../services/payments/imepayService.js";

export const initiatePayment = asyncWrapper(async (req, res) => {
  const { orderId, provider } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError("Order not found", 404);
  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError("Not authorized", 403);
  }
  if (order.paymentStatus === "completed") {
    throw new ApiError("Payment already completed", 400);
  }
  let result;
  if (provider === "khalti") result = await initiateKhalti(req.user, order);
  else if (provider === "esewa") result = await initiateEsewa(req.user, order);
  else if (provider === "imepay") result = await initiateImepay(req.user, order);
  else if (provider === "cod") result = { paymentUrl: null, transactionId: `COD-${Date.now()}` };
  else throw new ApiError("Invalid payment provider", 400);

  const existing = await Payment.findOne({ order: order._id });
  let payment;
  if (existing) {
    existing.provider = provider;
    existing.transactionId = result.transactionId;
    existing.status = "processing";
    existing.response = result;
    payment = await existing.save();
  } else {
    payment = await Payment.create({
      user: req.user._id,
      order: order._id,
      provider,
      transactionId: result.transactionId,
      amount: order.total,
      currency: "NPR",
      status: "processing",
      response: result,
    });
  }

  order.paymentStatus = provider === "cod" ? "pending" : "processing";
  await order.save();

  res.status(200).json({ status: "success", paymentUrl: result.paymentUrl, payment });
});

export const verifyKhaltiPayment = asyncWrapper(async (req, res) => {
  const { transactionId } = req.body;
  const valid = await verifyKhalti(transactionId);
  const payment = await Payment.findOne({ transactionId });
  if (!payment) throw new ApiError("Payment not found", 404);
  if (payment.user.toString() !== req.user._id.toString()) {
    throw new ApiError("Not authorized to verify this payment", 403);
  }
  const order = await Order.findById(payment.order);
  if (valid) {
    payment.status = "completed";
    payment.paidAt = new Date();
    order.paymentStatus = "completed";
    order.orderStatus = "confirmed";
  } else {
    payment.status = "failed";
    order.paymentStatus = "failed";
  }
  await payment.save();
  await order.save();
  res.status(200).json({ status: "success", payment, order });
});

export const verifyEsewaPayment = asyncWrapper(async (req, res) => {
  const { transactionId } = req.body;
  const valid = await verifyEsewa(transactionId);
  const payment = await Payment.findOne({ transactionId });
  if (!payment) throw new ApiError("Payment not found", 404);
  if (payment.user.toString() !== req.user._id.toString()) {
    throw new ApiError("Not authorized to verify this payment", 403);
  }
  const order = await Order.findById(payment.order);
  if (valid) {
    payment.status = "completed";
    payment.paidAt = new Date();
    order.paymentStatus = "completed";
    order.orderStatus = "confirmed";
  } else {
    payment.status = "failed";
    order.paymentStatus = "failed";
  }
  await payment.save();
  await order.save();
  res.status(200).json({ status: "success", payment, order });
});

export const verifyImepayPayment = asyncWrapper(async (req, res) => {
  const { transactionId } = req.body;
  const valid = await verifyImepay(transactionId);
  const payment = await Payment.findOne({ transactionId });
  if (!payment) throw new ApiError("Payment not found", 404);
  if (payment.user.toString() !== req.user._id.toString()) {
    throw new ApiError("Not authorized to verify this payment", 403);
  }
  const order = await Order.findById(payment.order);
  if (valid) {
    payment.status = "completed";
    payment.paidAt = new Date();
    order.paymentStatus = "completed";
    order.orderStatus = "confirmed";
  } else {
    payment.status = "failed";
    order.paymentStatus = "failed";
  }
  await payment.save();
  await order.save();
  res.status(200).json({ status: "success", payment, order });
});
