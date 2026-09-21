import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cartController.js";

const router = express.Router();
router.use(protect);
router.get("/", getCart);
router.post("/", addToCart);
router.put("/:mealId", updateCartItem);
router.delete("/:mealId", removeFromCart);
router.delete("/", clearCart);

export default router;
