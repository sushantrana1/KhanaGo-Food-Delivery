import User from "../models/User.js";
import Order from "../models/Order.js";
import Meal from "../models/Meal.js";
import Deal from "../models/Deal.js";
import { asyncWrapper } from "../utils/apiError.js";

export const getDashboardStats = asyncWrapper(async (req, res) => {
  const [users, orders, revenueResult, pendingOrders, completedOrders] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: "completed" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    Order.countDocuments({ orderStatus: "pending" }),
    Order.countDocuments({ orderStatus: "delivered" }),
  ]);
  const revenue = revenueResult[0]?.total || 0;
  res.status(200).json({ status: "success", stats: { users, orders, revenue, pendingOrders, completedOrders } });
});

export const getAllUsers = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 20, search = "" } = req.query;
  const query = search ? { name: { $regex: search, $options: "i" } } : {};
  const users = await User.find(query).skip((page - 1) * limit).limit(limit);
  const total = await User.countDocuments(query);
  res.status(200).json({ status: "success", count: users.length, total, results: users });
});

export const updateUser = asyncWrapper(async (req, res) => {
  const { role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ status: "success", user });
});

export const getAllOrders = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { orderStatus: status } : {};
  const orders = await Order.find(query).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });
  const total = await Order.countDocuments(query);
  res.status(200).json({ status: "success", count: orders.length, total, results: orders });
});

export const updateOrderStatus = asyncWrapper(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true, runValidators: true });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.status(200).json({ status: "success", order });
});

export const getAllMeals = asyncWrapper(async (req, res) => {
  const meals = await Meal.find().sort({ createdAt: -1 });
  res.status(200).json({ status: "success", count: meals.length, results: meals });
});

export const updateMeal = asyncWrapper(async (req, res) => {
  const meal = await Meal.findOneAndUpdate({ externalMealId: req.params.mealId }, req.body, { new: true });
  if (!meal) return res.status(404).json({ message: "Meal not found" });
  res.status(200).json({ status: "success", meal });
});

export const getAllDeals = asyncWrapper(async (req, res) => {
  const deals = await Deal.find().populate("meal", "name image").sort({ createdAt: -1 });
  res.status(200).json({ status: "success", count: deals.length, results: deals });
});

export const createDeal = asyncWrapper(async (req, res) => {
  const deal = await Deal.create(req.body);
  res.status(201).json({ status: "success", data: deal });
});

export const updateDeal = asyncWrapper(async (req, res) => {
  const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!deal) return res.status(404).json({ message: "Deal not found" });
  res.status(200).json({ status: "success", data: deal });
});

export const deleteDeal = asyncWrapper(async (req, res) => {
  await Deal.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: "success", data: null });
});
