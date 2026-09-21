import Cart from "../models/Cart.js";
import { asyncWrapper } from "../utils/apiError.js";

export const getCart = asyncWrapper(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate("user", "name email");
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  res.status(200).json({ status: "success", cart });
});

export const addToCart = asyncWrapper(async (req, res) => {
  const { mealId, name, image, price, quantity = 1 } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  const itemIndex = cart.items.findIndex((i) => i.mealId === mealId);
  if (itemIndex >= 0) {
    cart.items[itemIndex].quantity += parseInt(quantity);
  } else {
    cart.items.push({ mealId, name, image, price, quantity: parseInt(quantity) });
  }
  await cart.save();
  res.status(200).json({ status: "success", cart });
});

export const updateCartItem = asyncWrapper(async (req, res) => {
  const { mealId } = req.params;
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });
  const item = cart.items.find((i) => i.mealId === mealId);
  if (!item) return res.status(404).json({ message: "Item not found in cart" });
  item.quantity = parseInt(quantity);
  if (item.quantity <= 0) {
    cart.items = cart.items.filter((i) => i.mealId !== mealId);
  }
  await cart.save();
  res.status(200).json({ status: "success", cart });
});

export const removeFromCart = asyncWrapper(async (req, res) => {
  const { mealId } = req.params;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });
  cart.items = cart.items.filter((i) => i.mealId !== mealId);
  await cart.save();
  res.status(200).json({ status: "success", cart });
});

export const clearCart = asyncWrapper(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });
  cart.items = [];
  await cart.save();
  res.status(200).json({ status: "success", cart });
});
