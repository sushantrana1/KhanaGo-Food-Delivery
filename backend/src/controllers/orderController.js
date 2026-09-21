import Order from "../models/Order.js";
import { calculateOrderTotal } from "../utils/calculateOrderTotal.js";
import { ApiError, asyncWrapper } from "../utils/apiError.js";

export const createOrder = asyncWrapper(async (req, res) => {
  const { items, deliveryAddress, paymentMethod } = req.body;
  if (!items || items.length === 0) {
    throw new ApiError("Cart is empty", 400);
  }
  const validatedItems = items.map((item) => ({
    mealId: item.mealId,
    name: item.name,
    image: item.image || "",
    price: Number(item.price),
    quantity: Number(item.quantity),
  }));
  const codSurcharge = paymentMethod === "cod" ? 20 : 0;
  const { subtotal, deliveryFee, tax, discount, codSurcharge: surcharge, total } = calculateOrderTotal(validatedItems, undefined, codSurcharge);
  const order = await Order.create({
    user: req.user._id,
    items: validatedItems,
    deliveryAddress,
    subtotal,
    deliveryFee,
    tax,
    discount,
    codSurcharge: surcharge,
    total,
    paymentMethod,
    paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
    orderStatus: "pending",
  });
  res.status(201).json({ status: "success", order });
});

export const getOrders = asyncWrapper(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ status: "success", count: orders.length, results: orders });
});

export const getOrderById = asyncWrapper(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ApiError("Order not found", 404));
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new ApiError("Not authorized to view this order", 403));
  }
  res.status(200).json({ status: "success", order });
});

export const cancelOrder = asyncWrapper(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ApiError("Order not found", 404));
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ApiError("Not authorized", 403));
  }
  if (!["pending", "confirmed"].includes(order.orderStatus)) {
    return next(new ApiError("Order cannot be cancelled at this stage", 400));
  }
  order.orderStatus = "cancelled";
  if (order.paymentStatus === "completed") order.paymentStatus = "refunded";
  await order.save();
  res.status(200).json({ status: "success", order });
});

export const trackOrder = asyncWrapper(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }
  const statuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];
  const currentIndex = statuses.indexOf(order.orderStatus);
  const timeline = statuses.map((status, idx) => ({
    status,
    label: status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    completed: order.orderStatus === "cancelled" ? false : idx <= currentIndex,
    current: order.orderStatus === "cancelled" ? false : idx === currentIndex,
  }));
  res.status(200).json({ status: "success", order, timeline, cancelled: order.orderStatus === "cancelled" });
});
