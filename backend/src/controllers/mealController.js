import axios from "axios";
import { config } from "../config/env.js";
import Meal from "../models/Meal.js";
import { ApiError, asyncWrapper } from "../utils/apiError.js";

const client = axios.create({
  baseURL: config.themealdbUrl,
  timeout: 15000,
});

const safeGet = async (url, config = {}) => {
  try {
    const { data } = await client.get(url, config);
    return data;
  } catch (error) {
    console.error(`External API request failed: ${url}`, error.message);
    return null;
  }
};

const mapMeal = (m) => ({
  externalMealId: m.idMeal,
  name: m.strMeal,
  category: m.strCategory || "",
  area: m.strArea || "",
  image: m.strMealThumb || "",
  instructions: m.strInstructions || "",
  youtubeUrl: m.strYoutube || "",
  ingredients: Array.from({ length: 20 }, (_, i) => ({
    ingredient: m[`strIngredient${i + 1}`] || "",
    measure: m[`strMeasure${i + 1}`] || "",
  })).filter((x) => x.ingredient),
});

/* =========================================================
   FALLBACK PRICES (used when a meal is not in DB)
   ========================================================= */

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

  // Deterministic variance based on meal name (-10% to +10%)
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variance = ((hash % 21) - 10) / 100;

  // Tiny bump for longer names
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
   ENRICH: merge DB data with external API data
   ========================================================= */

const enrich = async (meals) => {
  if (!Array.isArray(meals)) return [];

  const seen = new Set();
  const mapped = [];
  for (const m of meals) {
    if (!m || !m.idMeal) continue;
    if (seen.has(m.idMeal)) continue;
    seen.add(m.idMeal);
    mapped.push(mapMeal(m));
  }

  const ids = mapped.map((m) => m.externalMealId).filter(Boolean);
  const docs = ids.length
    ? await Meal.find({ externalMealId: { $in: ids } })
    : [];
  const map = new Map(docs.map((d) => [d.externalMealId, d]));

  return mapped.map((m) => {
    const doc = map.get(m.externalMealId);

    // If the meal exists in DB, use its stored values
    if (doc) {
      return {
        ...m,
        price: doc.price,
        isAvailable: doc.isAvailable,
        isFeatured: doc.isFeatured,
        discount: doc.discount,
        rating: doc.rating,
      };
    }

    // Otherwise, generate a realistic fallback price
    return {
      ...m,
      price: computeFallbackPrice(m.category, m.name),
      isAvailable: true,
      isFeatured: false,
      discount: 0,
      rating: computeFallbackRating(m.name),
    };
  });
};

/* =========================================================
   CONTROLLERS
   ========================================================= */

export const getMeals = asyncWrapper(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 20);
  const data = await safeGet("/search.php?s=");
  const meals = await enrich(data?.meals || []);
  const start = (page - 1) * limit;
  const paginated = meals.slice(start, start + limit);
  res
    .status(200)
    .json({ status: "success", count: meals.length, results: paginated });
});

export const searchMeals = asyncWrapper(async (req, res) => {
  const { q } = req.query;
  if (!q)
    return res.status(400).json({ message: "Query parameter q is required" });
  const data = await safeGet("/search.php", { params: { s: q } });
  const meals = await enrich(data?.meals || []);
  res
    .status(200)
    .json({ status: "success", count: meals.length, results: meals });
});

export const getMealsByCategory = asyncWrapper(async (req, res) => {
  const { category } = req.params;
  const data = await safeGet("/filter.php", { params: { c: category } });
  const meals = await enrich(data?.meals || []);
  res
    .status(200)
    .json({
      status: "success",
      category,
      count: meals.length,
      results: meals,
    });
});

export const getMealsByArea = asyncWrapper(async (req, res) => {
  const { area } = req.params;
  const data = await safeGet("/filter.php", { params: { a: area } });
  const meals = await enrich(data?.meals || []);
  res
    .status(200)
    .json({ status: "success", area, count: meals.length, results: meals });
});

export const getMealsByIngredient = asyncWrapper(async (req, res) => {
  const { ingredient } = req.params;
  const data = await safeGet("/filter.php", { params: { i: ingredient } });
  const meals = await enrich(data?.meals || []);
  res
    .status(200)
    .json({
      status: "success",
      ingredient,
      count: meals.length,
      results: meals,
    });
});

export const getMealById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const data = await safeGet("/lookup.php", { params: { i: id } });
  const rawMeal = data?.meals?.[0];
  if (!rawMeal) return next(new ApiError("Meal not found", 404));
  const meal = (await enrich([rawMeal]))[0];
  if (!meal) return next(new ApiError("Meal not found", 404));
  res.status(200).json({ status: "success", results: meal });
});

export const getRandomMeals = asyncWrapper(async (req, res) => {
  const count = parseInt(req.query.count) || 8;
  const promises = Array.from({ length: count }, () => safeGet("/random.php"));
  const responses = await Promise.allSettled(promises);
  const rawMeals = responses
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value?.meals?.[0])
    .filter(Boolean);
  const seen = new Set();
  const uniqueRawMeals = rawMeals.filter((m) => {
    if (seen.has(m.idMeal)) return false;
    seen.add(m.idMeal);
    return true;
  });
  const meals = await enrich(uniqueRawMeals);
  res
    .status(200)
    .json({ status: "success", count: meals.length, results: meals });
});

export const getCategories = asyncWrapper(async (req, res) => {
  const data = await safeGet("/categories.php");
  res
    .status(200)
    .json({ status: "success", categories: data?.categories || [] });
});

export const getCategoryList = asyncWrapper(async (req, res) => {
  const data = await safeGet("/list.php", { params: { c: "list" } });
  res
    .status(200)
    .json({ status: "success", categories: data?.meals || [] });
});

export const getAreaList = asyncWrapper(async (req, res) => {
  const data = await safeGet("/list.php", { params: { a: "list" } });
  res.status(200).json({ status: "success", areas: data?.meals || [] });
});

export const getIngredientList = asyncWrapper(async (req, res) => {
  const data = await safeGet("/list.php", { params: { i: "list" } });
  res.status(200).json({ status: "success", ingredients: data?.meals || [] });
});

export const syncMeal = asyncWrapper(async (req, res) => {
  const { externalMealId } = req.body;
  const data = await safeGet("/lookup.php", { params: { i: externalMealId } });
  const raw = data?.meals && data.meals[0];
  if (!raw) return next(new ApiError("Meal not found in TheMealDB", 404));
  const mapped = mapMeal(raw);
  const meal = await Meal.findOneAndUpdate(
    { externalMealId: mapped.externalMealId },
    mapped,
    { new: true, upsert: true }
  );
  res.status(200).json({ status: "success", meal });
});