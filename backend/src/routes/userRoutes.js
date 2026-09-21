import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getProfile, updateProfile, addAddress, updateAddress, deleteAddress } from "../controllers/userController.js";

const router = express.Router();
router.use(protect);
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.post("/addresses", addAddress);
router.put("/addresses/:id", updateAddress);
router.delete("/addresses/:id", deleteAddress);

export default router;
