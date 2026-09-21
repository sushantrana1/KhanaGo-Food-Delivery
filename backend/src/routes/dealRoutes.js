import express from "express";
import { getActiveDeals, getDealById, claimDeal, createDeal, getAllDeals, updateDeal, deleteDeal } from "../controllers/dealController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getActiveDeals);
router.get("/all", protect, getAllDeals);
router.get("/:id", getDealById);
router.post("/:id/claim", protect, claimDeal);
router.post("/", protect, createDeal);
router.put("/:id", protect, updateDeal);
router.delete("/:id", protect, deleteDeal);

export default router;
