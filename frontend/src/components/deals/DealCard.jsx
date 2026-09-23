import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Clock,
  ArrowRight,
  Flame,
  Zap,
  CheckCircle2,
  Loader2,
  Users,
} from "lucide-react";
import { claimDeal } from "../../services/dealApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../common/Toast.jsx";

export default function DealCard({ deal, onClaimed }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  // Safe field extraction
  const meal = deal.meal || {};
  const mealId = meal.externalMealId || meal._id;
  const image = meal.image || deal.image || "";
  const name = meal.name || deal.title || "Special Deal";
  const discountPercentage = deal.discountPercentage || 0;
  const dealPrice = deal.dealPrice || 0;
  const originalPrice = deal.originalPrice || 0;
  const hoursLeft = deal.hoursLeft ?? 0;
  const minutesLeft = deal.minutesLeft ?? 0;
  const remaining = deal.remaining ?? deal.maxClaims ?? 0;
  const maxClaims = deal.maxClaims || remaining || 1;
  const badge = deal.badge || "Hot Deal";

  // Progress of claims
  const claimedCount = deal.claimedCount || 0;
  const progressPct =
    maxClaims > 0
      ? Math.min(100, Math.round((claimedCount / maxClaims) * 100))
      : 0;
  const isLowStock = remaining > 0 && remaining <= 5;
  const isSoldOut = remaining <= 0;

  // Claim handler
  const handleClaim = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (isSoldOut || claiming) return;

    setClaiming(true);
    try {
      const res = await claimDeal(deal._id, {});
      setClaimed(true);
      addToast(`Deal claimed! Enjoy Rs. ${dealPrice}`, "success");
      if (onClaimed) onClaimed(deal._id);

      const redirectTo = res.data?.data?.redirectTo;
      if (redirectTo) {
        navigate(redirectTo);
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to claim deal",
        "error"
      );
    } finally {
      setClaiming(false);
    }
  };

  // ===== CLAIMED STATE =====
  if (claimed) {
    return (
      <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
        <div className="relative aspect-video overflow-hidden bg-slate-100">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
              <CheckCircle2 size={28} />
            </div>
            <p className="text-sm font-bold uppercase tracking-wider">
              Claimed
            </p>
          </div>
          <span className="absolute left-2 top-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
            -{discountPercentage}%
          </span>
        </div>

        <div className="p-4">
          <h3 className="truncate text-sm font-bold text-slate-800 sm:text-base">
            {name}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 sm:text-xs">
            <Clock size={11} />
            Ends in {hoursLeft}h {minutesLeft}m
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-slate-900">
              Rs. {dealPrice}
            </span>
            <span className="text-xs font-medium text-slate-400 line-through">
              Rs. {originalPrice}
            </span>
          </div>
          <Link
            to="/orders"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
          >
            View Order <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    );
  }

  // ===== ACTIVE DEAL =====
  return (
    <Link
      to={`/meals/${mealId}`}
      className="group relative block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-100 hover:shadow-xl"
    >
      {/* IMAGE */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
          <Zap size={11} className="fill-white" />
          -{discountPercentage}%
        </div>

        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
          <Flame size={11} className="fill-white" />
          {badge}
        </div>

        <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <Clock size={11} />
            Ends in {hoursLeft}h {minutesLeft}m
          </div>

          {isLowStock && (
            <div className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-[11px] font-bold text-white shadow-sm">
              <Flame size={11} className="fill-white" />
              {remaining} left!
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="space-y-3 p-4">
        <div>
          <h3 className="truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-orange-600 sm:text-base">
            {name}
          </h3>
          {meal.category && (
            <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
              {meal.area ? `${meal.area} · ` : ""}
              {meal.category}
            </p>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-slate-900 sm:text-2xl">
            Rs. {dealPrice}
          </span>
          <span className="text-xs font-medium text-slate-400 line-through sm:text-sm">
            Rs. {originalPrice}
          </span>
          <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            Save Rs. {originalPrice - dealPrice}
          </span>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500 sm:text-xs">
            <span className="flex items-center gap-1">
              <Users size={11} />
              {claimedCount} claimed
            </span>
            <span className="font-bold text-slate-700">
              {remaining} left
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPct > 75
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : progressPct > 40
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleClaim}
          disabled={claiming || isSoldOut}
          className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed ${
            isSoldOut
              ? "bg-slate-300 shadow-none"
              : "bg-gradient-to-r from-orange-500 to-red-500 hover:-translate-y-0.5 hover:shadow-lg"
          }`}
        >
          {claiming ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Claiming...
            </>
          ) : isSoldOut ? (
            "Sold Out"
          ) : (
            <>
              Claim Deal
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </Link>
  );
}