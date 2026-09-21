import User from "../models/User.js";
import { asyncWrapper } from "../utils/apiError.js";

export const getProfile = asyncWrapper(async (req, res) => {
  res.status(200).json({ status: "success", user: req.user });
});

export const updateProfile = asyncWrapper(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findById(req.user._id);
  user.name = name || user.name;
  user.phone = phone || user.phone;
  user.avatar = avatar || user.avatar;
  await user.save();
  res.status(200).json({ status: "success", user });
});

export const addAddress = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ status: "success", addresses: user.addresses });
});

export const updateAddress = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id);
  const idx = user.addresses.findIndex((a) => a._id.toString() === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Address not found" });
  user.addresses[idx].set(req.body);
  await user.save();
  res.status(200).json({ status: "success", addresses: user.addresses });
});

export const deleteAddress = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.id);
  await user.save();
  res.status(200).json({ status: "success", addresses: user.addresses });
});
