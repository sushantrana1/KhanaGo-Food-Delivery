import express from "express";
import { getMeals, searchMeals, getMealsByCategory, getMealsByArea, getMealsByIngredient, getMealById, getRandomMeals, getCategories, getCategoryList, getAreaList, getIngredientList, syncMeal } from "../controllers/mealController.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();
router.get("/", getMeals);
router.get("/search", searchMeals);
router.get("/categories", getCategories);
router.get("/categories/list", getCategoryList);
router.get("/areas/list", getAreaList);
router.get("/ingredients/list", getIngredientList);
router.get("/category/:category", getMealsByCategory);
router.get("/area/:area", getMealsByArea);
router.get("/ingredient/:ingredient", getMealsByIngredient);
router.get("/random", getRandomMeals);
router.get("/:id", getMealById);
router.post("/sync", adminOnly, syncMeal);

export default router;
