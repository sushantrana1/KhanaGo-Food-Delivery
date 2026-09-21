import Favorite from "../models/Favorite.js";
import { asyncWrapper } from "../utils/apiError.js";

export const getFavorites = asyncWrapper(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ status: "success", count: favorites.length, results: favorites });
});

export const addFavorite = asyncWrapper(async (req, res) => {
  const { mealId } = req.params;
  const { name, image, category, area } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Meal name is required" });
  }
  const favorite = await Favorite.create({
    user: req.user._id,
    mealId,
    name,
    image: image || "",
    category: category || "",
    area: area || "",
  });
  res.status(201).json({ status: "success", favorite });
});

export const removeFavorite = asyncWrapper(async (req, res) => {
  const { mealId } = req.params;
  await Favorite.findOneAndDelete({ user: req.user._id, mealId });
  res.status(200).json({ status: "success", message: "Removed from favorites" });
});
