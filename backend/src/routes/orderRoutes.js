import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createOrder, getOrders, getOrderById, cancelOrder, trackOrder } from "../controllers/orderController.js";

const router = express.Router();
router.use(protect);
router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);
router.get("/:id/track", trackOrder);

export default router;
