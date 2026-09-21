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
    return { ...m, ...(doc ? { price: doc.price, isAvailable: doc.isAvailable, isFeatured: doc.isFeatured, discount: doc.discount, rating: doc.rating } : {}) };
  });
};

export const getMeals = asyncWrapper(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 20);
  const data = await safeGet("/search.php?s=");
  const meals = await enrich(data?.meals || []);
  const start = (page - 1) * limit;
  const paginated = meals.slice(start, start + limit);
  res.status(200).json({ status: "success", count: meals.length, results: paginated });
});

export const searchMeals = asyncWrapper(async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: "Query parameter q is required" });
  const data = await safeGet("/search.php", { params: { s: q } });
  const meals = await enrich(data?.meals || []);
  res.status(200).json({ status: "success", count: meals.length, results: meals });
});

export const getMealsByCategory = asyncWrapper(async (req, res) => {
  const { category } = req.params;
  const data = await safeGet("/filter.php", { params: { c: category } });
  const meals = await enrich(data?.meals || []);
  res.status(200).json({ status: "success", category, count: meals.length, results: meals });
});

export const getMealsByArea = asyncWrapper(async (req, res) => {
  const { area } = req.params;
  const data = await safeGet("/filter.php", { params: { a: area } });
  const meals = await enrich(data?.meals || []);
  res.status(200).json({ status: "success", area, count: meals.length, results: meals });
});

export const getMealsByIngredient = asyncWrapper(async (req, res) => {
  const { ingredient } = req.params;
  const data = await safeGet("/filter.php", { params: { i: ingredient } });
  const meals = await enrich(data?.meals || []);
  res.status(200).json({ status: "success", ingredient, count: meals.length, results: meals });
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
  res.status(200).json({ status: "success", count: meals.length, results: meals });
});

export const getCategories = asyncWrapper(async (req, res) => {
  const data = await safeGet("/categories.php");
  res.status(200).json({ status: "success", categories: data?.categories || [] });
});

export const getCategoryList = asyncWrapper(async (req, res) => {
  const data = await safeGet("/list.php", { params: { c: "list" } });
  res.status(200).json({ status: "success", categories: data?.meals || [] });
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
  const meal = await Meal.findOneAndUpdate({ externalMealId: mapped.externalMealId }, mapped, { new: true, upsert: true });
  res.status(200).json({ status: "success", meal });
});
