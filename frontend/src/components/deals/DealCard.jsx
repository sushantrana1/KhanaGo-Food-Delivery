import { Link } from "react-router-dom";
import { Clock, ArrowRight, Flame } from "lucide-react";
import { claimDeal } from "../../services/dealApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useState } from "react";

export default function DealCard({ deal, onClaimed }) {
  const { user } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const meal = deal.meal || {};
  const mealId = meal.externalMealId || meal._id;
  const image = meal.image || deal.image || "";
  const name = meal.name || "Special Deal";
  const discountPercentage = deal.discountPercentage;
  const dealPrice = deal.dealPrice;
  const originalPrice = deal.originalPrice;
  const hoursLeft = deal.hoursLeft;
  const minutesLeft = deal.minutesLeft;
  const remaining = deal.remaining;
  const badge = deal.badge || "Hot Deal";

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setClaiming(true);
    try {
      await claimDeal(deal._id, {});
      setClaimed(true);
      if (onClaimed) onClaimed(deal._id);
    } catch (err) {
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  if (claimed) {
    return (
      <div className="card card-hover overflow-hidden">
        <div className="relative">
          <div className="aspect-video overflow-hidden bg-slate-50">
            <img src={image} alt={name} className="w-full h-full object-cover" loading="lazy" />
          </div>
          <span className="discount-badge text-sm px-3 py-1">-{discountPercentage}%</span>
          <span className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
            Claimed
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-slate-800 mb-1 truncate">{name}</h3>
          <div className="flex items-center gap-1 mb-2 text-xs text-slate-500">
            <Clock size={12} />
            <span>Ends in {hoursLeft}h {minutesLeft}m</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-slate-800">Rs. {dealPrice}</span>
              <span className="text-xs text-slate-400 line-through ml-1">Rs. {originalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link to={`/meals/${mealId}`} className="card card-hover card-interactive group block">
      <div className="relative">
        <div className="aspect-video overflow-hidden bg-slate-50">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <span className="discount-badge text-sm px-3 py-1">-{discountPercentage}%</span>
        <span className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
          {badge}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-800 mb-1 truncate group-hover:text-orange-600 transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-1 mb-2 text-xs text-slate-500">
          <Clock size={12} />
          <span>Ends in {hoursLeft}h {minutesLeft}m</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-slate-800">Rs. {dealPrice}</span>
            <span className="text-xs text-slate-400 line-through ml-1">Rs. {originalPrice}</span>
          </div>
          <button
            onClick={handleClaim}
            disabled={claiming || remaining <= 0}
            className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {claiming ? "Claiming..." : remaining > 0 ? "Claim" : "Sold Out"}
            {!claiming && remaining > 0 && <ArrowRight size={12} />}
          </button>
        </div>
        {remaining > 0 && (
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Flame size={12} className="text-orange-500" />
            Only {remaining} left!
          </p>
        )}
      </div>
    </Link>
  );
}
