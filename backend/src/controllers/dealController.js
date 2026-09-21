import { ApiError } from "../utils/apiError.js";
import { asyncWrapper } from "../utils/apiError.js";
import Deal from "../models/Deal.js";
import Order from "../models/Order.js";

export const getActiveDeals = asyncWrapper(async (req, res) => {
  const deals = await Deal.find({ isActive: true, endDate: { $gte: new Date() } })
    .populate("meal", "name image category area rating externalMealId")
    .sort({ createdAt: -1 })
    .limit(20);

  const now = new Date();
  const activeDeals = deals.map((deal) => {
    const timeLeft = deal.endDate - now;
    const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
    const minutesLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));
    const remaining = deal.maxClaims - deal.claimedCount;
    return { ...deal.toObject(), hoursLeft, minutesLeft, remaining };
  });

  res.status(200).json({ status: "success", results: activeDeals });
});

export const getDealById = asyncWrapper(async (req, res) => {
  const deal = await Deal.findById(req.params.id).populate("meal", "name image category area rating ingredients instructions externalMealId");
  if (!deal || !deal.isActive) throw new ApiError("Deal not found or expired", 404);

  const timeLeft = deal.endDate - new Date();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  const minutesLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));
  const remaining = deal.maxClaims - deal.claimedCount;

  res.status(200).json({
    status: "success",
    deal: { ...deal.toObject(), hoursLeft, minutesLeft, remaining },
  });
});

export const claimDeal = asyncWrapper(async (req, res) => {
  const deal = await Deal.findById(req.params.id).populate("meal", "name image externalMealId");
  if (!deal || !deal.isActive) throw new ApiError("Deal not found or expired", 404);
  if (deal.endDate < new Date()) throw new ApiError("Deal has expired", 400);
  if (deal.claimedCount >= deal.maxClaims) throw new ApiError("Deal has been fully claimed", 400);

  deal.claimedCount += 1;
  if (deal.claimedCount >= deal.maxClaims) deal.isActive = false;
  await deal.save();

  const order = await Order.create({
    user: req.user.id,
    items: [
      {
        mealId: deal.meal.externalMealId || deal.meal._id.toString(),
        name: deal.meal.name,
        image: deal.meal.image,
        price: deal.dealPrice,
        quantity: 1,
      },
    ],
    deliveryAddress: req.body.deliveryAddress || {},
    paymentMethod: req.body.paymentMethod || "cod",
    total: deal.dealPrice,
    orderStatus: "pending",
    paymentStatus: "pending",
  });

  res.status(201).json({
    status: "success",
    data: { deal, order },
    message: "Deal claimed successfully!",
  });
});

export const createDeal = asyncWrapper(async (req, res) => {
  const deal = await Deal.create(req.body);
  res.status(201).json({ status: "success", data: deal });
});

export const getAllDeals = asyncWrapper(async (req, res) => {
  const deals = await Deal.find().populate("meal", "name image").sort({ createdAt: -1 });
  res.status(200).json({ status: "success", results: deals });
});

export const updateDeal = asyncWrapper(async (req, res) => {
  const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!deal) throw new ApiError("Deal not found", 404);
  res.status(200).json({ status: "success", data: deal });
});

export const deleteDeal = asyncWrapper(async (req, res) => {
  await Deal.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: "success", data: null });
});
