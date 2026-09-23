import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Star, Heart, ShoppingCart, Zap, Clock } from "lucide-react";
import { useCart } from "../../context/CartContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { addFavorite, removeFavorite } from "../../services/favoriteApi.js";

export default function MealCard({ meal }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // ---- Price handling (no silent 450 fallback) ----
  const rawPrice = meal?.price;
  const hasPrice = typeof rawPrice === "number" && rawPrice > 0;
  const discount = meal?.discount || 0;
  const finalPrice = hasPrice
    ? discount > 0
      ? Math.round(rawPrice * (1 - discount / 100))
      : rawPrice
    : null;

  // ---- Add to cart ----
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding || !hasPrice) return;

    setAdding(true);
    addToCart({
      mealId: meal.externalMealId || meal.mealId,
      name: meal.name,
      image: meal.image,
      price: finalPrice,
      quantity: 1,
    });

    setTimeout(() => {
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    }, 300);
  };

  // ---- Buy now ----
  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/buy-now/${meal.externalMealId || meal.mealId}`);
  };

  // ---- Favorite ----
  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    const next = !isFavorite;
    setIsFavorite(next);

    try {
      if (next) {
        await addFavorite(meal.externalMealId || meal.mealId, {
          name: meal.name,
          image: meal.image,
          category: meal.category,
          area: meal.area,
        });
      } else {
        await removeFavorite(meal.externalMealId || meal.mealId);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setIsFavorite(!next);
    }
  };

  return (
    <Link
      to={`/meals/${meal.externalMealId || meal.mealId}`}
      className="meal-card group relative block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-100 hover:shadow-xl"
    >
      {/* ---- IMAGE ---- */}
      <div className="meal-card-image-wrapper relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={meal.image}
          alt={meal.name}
          loading="lazy"
          className="meal-card-image h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="meal-card-image-overlay" />

        {discount > 0 && (
          <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-2 py-1 text-[10px] font-bold text-white shadow-md sm:left-3 sm:top-3 sm:px-2.5 sm:text-xs">
            <Zap size={10} className="fill-white sm:hidden" />
            <Zap size={12} className="hidden fill-white sm:block" />
            {discount}% OFF
          </span>
        )}

        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 sm:right-3 sm:top-3 sm:h-9 sm:w-9 ${
            isFavorite
              ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
              : "bg-white/90 text-slate-400 shadow-md hover:bg-white hover:text-red-500"
          }`}
        >
          <Heart
            size={16}
            fill={isFavorite ? "currentColor" : "none"}
            className="transition-transform duration-200 sm:hidden"
          />
          <Heart
            size={18}
            fill={isFavorite ? "currentColor" : "none"}
            className="hidden transition-transform duration-200 sm:block"
          />
        </button>

        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 shadow-sm backdrop-blur-sm sm:bottom-3 sm:left-3 sm:px-2.5">
          <Star
            size={11}
            className="fill-amber-500 text-amber-500 sm:hidden"
          />
          <Star
            size={12}
            className="hidden fill-amber-500 text-amber-500 sm:block"
          />
          <span className="text-[10px] font-bold text-slate-800 sm:text-xs">
            {meal.rating || 4.5}
          </span>
        </div>

        <div className="absolute bottom-2 right-2 z-10 hidden items-center gap-1 rounded-full bg-white/95 px-2 py-1 shadow-sm backdrop-blur-sm sm:bottom-3 sm:right-3 sm:flex sm:px-2.5">
          <Clock size={11} className="text-slate-500" />
          <span className="text-[10px] font-semibold text-slate-700 sm:text-xs">
            30-45m
          </span>
        </div>
      </div>

      {/* ---- BODY ---- */}
      <div className="space-y-2.5 p-3 sm:space-y-3 sm:p-4">
        <div>
          <h3 className="truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-orange-600 sm:text-base">
            {meal.name}
          </h3>
          <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
            {meal.area}
            {meal.area && meal.category ? " • " : ""}
            {meal.category}
          </p>
        </div>

        {/* ---- Price row ---- */}
        <div className="flex items-baseline gap-1.5">
          {hasPrice ? (
            <>
              <span className="text-base font-black text-slate-900 sm:text-lg">
                Rs. {finalPrice}
              </span>
              {discount > 0 && (
                <span className="text-xs font-medium text-slate-400 line-through sm:text-sm">
                  Rs. {rawPrice}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-semibold italic text-slate-400 sm:text-sm">
              Price unavailable
            </span>
          )}
        </div>

        {/* ---- Actions ---- */}
        <div className="flex items-center gap-1.5 pt-0.5 sm:gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || !hasPrice}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm ${
              added
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-red-600"
            }`}
          >
            {added ? (
              <>
                <svg
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Added
              </>
            ) : (
              <>
                <ShoppingCart size={14} className="sm:hidden" />
                <ShoppingCart size={15} className="hidden sm:block" />
                Add
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            aria-label="Buy now"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 active:scale-95 sm:px-3 sm:py-2.5 sm:text-sm"
          >
            <Zap
              size={14}
              className="text-emerald-500 sm:hidden"
              fill="currentColor"
            />
            <Zap
              size={15}
              className="hidden text-emerald-500 sm:block"
              fill="currentColor"
            />
            <span className="hidden sm:inline">Buy</span>
          </button>
        </div>
      </div>
    </Link>
  );
}