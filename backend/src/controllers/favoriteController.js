import Favorite from "../models/Favorite.js";
import Meal from "../models/Meal.js";
import { asyncWrapper } from "../utils/apiError.js";

/* Fallback price by category (same as mealController) */
const FALLBACK_PRICE_BY_CATEGORY = {
  Beef: 750,
  Chicken: 550,
  Dessert: 250,
  Lamb: 850,
  Miscellaneous: 450,
  Pasta: 500,
  Pork: 700,
  Seafood: 900,
  Side: 200,
  Starter: 300,
  Vegan: 400,
  Vegetarian: 350,
  Breakfast: 250,
  Goat: 800,
};

const computeFallbackPrice = (category, name = "") => {
  const base = FALLBACK_PRICE_BY_CATEGORY[category] || 450;
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variance = ((hash % 21) - 10) / 100;
  const lengthBonus = Math.min(name.length, 40) / 400;
  const price = base * (1 + variance + lengthBonus);
  return Math.round(price / 10) * 10;
};

const computeFallbackRating = (name = "") => {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const base = 3.9 + (hash % 12) / 10;
  return Math.min(5.0, Math.round(base * 10) / 10);
};

/* =========================================================
   GET FAVORITES (enriched with price, rating, discount)
   ========================================================= */

export const getFavorites = asyncWrapper(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  if (favorites.length === 0) {
    return res
      .status(200)
      .json({ status: "success", count: 0, results: [] });
  }

  // Fetch all matching meals in one query
  const mealIds = favorites
    .map((f) => f.mealId || f.externalMealId)
    .filter(Boolean);

  const meals = await Meal.find({ externalMealId: { $in: mealIds } });
  const mealMap = new Map(meals.map((m) => [m.externalMealId, m]));

  // Merge
  const results = favorites.map((fav) => {
    const doc = mealMap.get(fav.mealId || fav.externalMealId);

    const base = {
      _id: fav._id,
      externalMealId: fav.mealId || fav.externalMealId,
      name: fav.name,
      image: fav.image,
      category: fav.category || "",
      area: fav.area || "",
      favoritedAt: fav.createdAt,
    };

    if (doc) {
      return {
        ...base,
        price: doc.price,
        rating: doc.rating,
        discount: doc.discount,
        isAvailable: doc.isAvailable,
        isFeatured: doc.isFeatured,
      };
    }

    // Fallback if meal not found in DB
    return {
      ...base,
      price: computeFallbackPrice(fav.category, fav.name),
      rating: computeFallbackRating(fav.name),
      discount: 0,
      isAvailable: true,
      isFeatured: false,
    };
  });

  res.status(200).json({
    status: "success",
    count: results.length,
    results,
  });
});

/* =========================================================
   ADD FAVORITE
   ========================================================= */

export const addFavorite = asyncWrapper(async (req, res) => {
  const { mealId } = req.params;
  const { name, image, category, area } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Meal name is required" });
  }

  // Prevent duplicates
  const existing = await Favorite.findOne({
    user: req.user._id,
    mealId,
  });

  if (existing) {
    return res
      .status(200)
      .json({ status: "success", favorite: existing, duplicate: true });
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

/* =========================================================
   REMOVE FAVORITE
   ========================================================= */

export const removeFavorite = asyncWrapper(async (req, res) => {
  const { mealId } = req.params;

  await Favorite.findOneAndDelete({
    user: req.user._id,
    mealId,
  });

  res
    .status(200)
    .json({ status: "success", message: "Removed from favorites" });
});