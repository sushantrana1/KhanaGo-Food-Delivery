import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { initiatePayment, verifyKhaltiPayment, verifyEsewaPayment, verifyImepayPayment } from "../controllers/paymentController.js";

const router = express.Router();
router.use(protect);
router.post("/initiate", initiatePayment);
router.post("/khalti/verify", verifyKhaltiPayment);
router.post("/esewa/verify", verifyEsewaPayment);
router.post("/imepay/verify", verifyImepayPayment);

export default router;
