import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { getDashboardStats, getAllUsers, updateUser, getAllOrders, updateOrderStatus, getAllMeals, updateMeal, getAllDeals, createDeal, updateDeal, deleteDeal } from "../controllers/adminController.js";

const router = express.Router();
router.use(protect, adminOnly);
router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.patch("/users/:id", updateUser);
router.get("/orders", getAllOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.get("/meals", getAllMeals);
router.patch("/meals/:mealId", updateMeal);
router.get("/deals", getAllDeals);
router.post("/deals", createDeal);
router.patch("/deals/:id", updateDeal);
router.delete("/deals/:id", deleteDeal);

export default router;
