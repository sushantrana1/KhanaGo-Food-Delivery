import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getFavorites, addFavorite, removeFavorite } from "../controllers/favoriteController.js";

const router = express.Router();
router.use(protect);
router.get("/", getFavorites);
router.post("/:mealId", addFavorite);
router.delete("/:mealId", removeFavorite);

export default router;
