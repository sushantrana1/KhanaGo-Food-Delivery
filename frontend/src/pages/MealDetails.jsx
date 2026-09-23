import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Heart,
  ShoppingCart,
  Clock,
  Utensils,
  Minus,
  Plus,
  Check,
  Zap,
  MapPin,
  ChefHat,
  Play,
  Share2,
  Truck,
  ShieldCheck,
  BadgePercent,
} from "lucide-react";

import { getMealById } from "../services/mealApi.js";
import { addFavorite, removeFavorite } from "../services/favoriteApi.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

/* ═══════════════════════════════════════════════════════
   INLINE SKELETON
   ═══════════════════════════════════════════════════════ */

function SkeletonBox({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

function MealDetailsSkeleton() {
  return (
    <div className="container section pt-6 sm:pt-8">
      <SkeletonBox className="mb-5 h-5 w-28 rounded" />

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,35%)_1fr] lg:gap-10">
        <div>
          <SkeletonBox className="aspect-[4/3] w-full rounded-3xl lg:aspect-square lg:max-h-[380px]" />
          <div className="mt-3 hidden grid-cols-3 gap-2 sm:grid sm:mt-4">
            <SkeletonBox className="h-16 rounded-xl sm:h-20" />
            <SkeletonBox className="h-16 rounded-xl sm:h-20" />
            <SkeletonBox className="h-16 rounded-xl sm:h-20" />
          </div>
        </div>

        <div className="space-y-5">
          <SkeletonBox className="h-6 w-24 rounded-full" />
          <SkeletonBox className="h-8 w-4/5 rounded-lg sm:h-9" />
          <SkeletonBox className="h-20 w-full rounded-2xl" />
          <div className="flex gap-3">
            <SkeletonBox className="h-12 w-32 rounded-xl" />
            <SkeletonBox className="h-12 flex-1 rounded-xl" />
          </div>
          <SkeletonBox className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function MealDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getMealById(id)
      .then((res) => {
        if (!cancelled) {
          setMeal(res.data.results);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load meal");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <MealDetailsSkeleton />;
  if (error) return <ErrorMessage message={error} />;
  if (!meal) return <ErrorMessage message="Meal not found" />;

  const price = meal.price || 450;
  const discount = meal.discount || 0;
  const finalPrice =
    discount > 0 ? Math.round(price * (1 - discount / 100)) : price;
  const ingredients = (meal.ingredients || []).filter((i) => i.ingredient);

  const handleAddToCart = () => {
    addToCart({
      mealId: meal.externalMealId || meal.mealId,
      name: meal.name,
      image: meal.image,
      price: finalPrice,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart({
      mealId: meal.externalMealId || meal.mealId,
      name: meal.name,
      image: meal.image,
      price: finalPrice,
      quantity: qty,
    });
    navigate("/checkout");
  };

  const toggleFav = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const next = !isFav;
    setIsFav(next);
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
      setIsFav(!next);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: meal.name, url });
      } catch {
        /* cancelled */
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-32 sm:pb-8">

      <div className="container pt-5 sm:pt-6 lg:pt-8">

        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-orange-500 sm:mb-6 sm:text-base"
        >
          <ArrowLeft size={18} /> Back
        </button>

        {/* ══════════════════════════════════════
            GRID
            Desktop: 35% image (sticky) / 65% details (scrolls)
            ══════════════════════════════════════ */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,35%)_1fr] lg:items-start lg:gap-10">

          {/* ═══ LEFT: IMAGE — sticky on desktop, only this stays fixed ═══ */}
          <div className="lg:sticky lg:top-24 lg:self-start lg:h-fit">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg shadow-orange-100/40 sm:max-w-none sm:rounded-3xl sm:shadow-xl lg:max-w-none">

              {/* Smaller on desktop: capped at 380px */}
              <img
                src={meal.image}
                alt={meal.name}
                className="aspect-[4/3] w-full object-cover sm:aspect-[4/3] lg:aspect-square lg:max-h-[380px]"
              />

              {discount > 0 && (
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-lg sm:left-4 sm:top-4 sm:px-3.5 sm:py-2 sm:text-xs">
                  <Zap size={12} className="fill-white sm:hidden" />
                  <Zap size={14} className="hidden fill-white sm:block" />
                  {discount}% OFF
                </div>
              )}

              <button
                onClick={toggleFav}
                aria-label="Favorite"
                className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 sm:right-4 sm:top-4 sm:h-10 sm:w-10 ${
                  isFav
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/40"
                    : "bg-white/95 text-slate-400 shadow-md hover:bg-white hover:text-red-500"
                }`}
              >
                <Heart
                  size={16}
                  fill={isFav ? "currentColor" : "none"}
                  className="sm:hidden"
                />
                <Heart
                  size={18}
                  fill={isFav ? "currentColor" : "none"}
                  className="hidden sm:block"
                />
              </button>

              <button
                onClick={handleShare}
                aria-label="Share"
                className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 hover:text-orange-500 sm:bottom-4 sm:right-4 sm:h-10 sm:w-10"
              >
                <Share2 size={15} className="sm:hidden" />
                <Share2 size={17} className="hidden sm:block" />
              </button>

              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1.5 shadow-md backdrop-blur-md sm:bottom-4 sm:left-4 sm:px-3.5 sm:py-2">
                <Star
                  size={12}
                  className="fill-amber-500 text-amber-500 sm:hidden"
                />
                <Star
                  size={15}
                  className="hidden fill-amber-500 text-amber-500 sm:block"
                />
                <span className="text-[11px] font-bold text-slate-800 sm:text-sm">
                  {meal.rating || 4.5}
                </span>
                <span className="text-[10px] text-slate-400 sm:text-xs">
                  (120+)
                </span>
              </div>
            </div>

            {/* Trust badges (desktop) */}
            <div className="mt-4 hidden grid-cols-3 gap-2.5 lg:grid">
              {[
                { icon: Truck, label: "Fast", sub: "30-45m" },
                { icon: ShieldCheck, label: "Safe", sub: "Hygienic" },
                { icon: BadgePercent, label: "Best", sub: "Price" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-100 bg-white p-2.5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                    <Icon size={14} />
                  </div>
                  <p className="text-[11px] font-bold text-slate-800">{label}</p>
                  <p className="text-[10px] text-slate-500">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ RIGHT: DETAILS — scrolls with page ═══ */}
          <div className="space-y-5 sm:space-y-6">

            <div className="flex flex-wrap items-center gap-2">
              {meal.category && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 sm:text-sm">
                  <ChefHat size={13} />
                  {meal.category}
                </span>
              )}
              {meal.area && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:text-sm">
                  <MapPin size={13} />
                  {meal.area}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 sm:text-sm">
                <Clock size={13} />
                30-45 min
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                {meal.name}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">
                Delicious {meal.category?.toLowerCase() || "dish"} from{" "}
                {meal.area || "our kitchen"} — freshly prepared and delivered
                hot to your door.
              </p>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50/80 to-red-50/60 p-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 sm:text-3xl">
                  Rs. {finalPrice}
                </span>
                {discount > 0 && (
                  <span className="text-sm font-medium text-slate-400 line-through sm:text-base">
                    Rs. {price}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <span className="ml-auto rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm sm:text-xs">
                  Save Rs. {price - finalPrice}
                </span>
              )}
            </div>

            {/* Desktop actions */}
            <div className="hidden items-center gap-3 sm:flex">
              <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="flex h-12 w-12 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                  aria-label="Decrease quantity"
                >
                  <Minus size={18} />
                </button>
                <span className="flex h-12 w-14 items-center justify-center border-x border-slate-200 text-base font-bold text-slate-900">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="flex h-12 w-12 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                  aria-label="Increase quantity"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] ${
                  added
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-200"
                    : "bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-200"
                }`}
              >
                {added ? (
                  <>
                    <Check size={20} /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
              >
                <Zap size={18} className="text-emerald-500" fill="currentColor" />
                Buy Now
              </button>
            </div>

            {/* Mobile trust badges */}
            <div className="grid grid-cols-3 gap-2 sm:hidden">
              {[
                { icon: Truck, label: "Fast", sub: "30-45m" },
                { icon: ShieldCheck, label: "Safe", sub: "Hygienic" },
                { icon: BadgePercent, label: "Best", sub: "Price" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-100 bg-white p-2.5 text-center shadow-sm"
                >
                  <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                    <Icon size={14} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-800">{label}</p>
                  <p className="text-[9px] text-slate-500">{sub}</p>
                </div>
              ))}
            </div>

            {/* Ingredients */}
            {ingredients.length > 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex items-center gap-2 sm:mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
                    <Utensils size={17} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 sm:text-base">
                      Ingredients
                    </h3>
                    <p className="text-[11px] text-slate-500 sm:text-xs">
                      {ingredients.length} items
                    </p>
                  </div>
                </div>

                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
                  {ingredients.map((ing, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-slate-50/80 px-2.5 py-2 text-xs sm:px-3 sm:text-sm"
                    >
                      <span className="flex items-center gap-2 font-medium text-slate-700">
                        <Check
                          size={13}
                          className="shrink-0 text-emerald-500"
                        />
                        {ing.ingredient}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-500 sm:text-xs">
                        {ing.measure}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions */}
            {meal.instructions && (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex items-center gap-2 sm:mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
                    <ChefHat size={17} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 sm:text-base">
                      How to Prepare
                    </h3>
                    <p className="text-[11px] text-slate-500 sm:text-xs">
                      Step-by-step instructions
                    </p>
                  </div>
                </div>

                <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {meal.instructions}
                </p>
              </div>
            )}

            {/* YouTube */}
            {meal.youtubeUrl && (
              <a
                href={meal.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white shadow-md shadow-red-200 sm:h-12 sm:w-12">
                  <Play size={18} className="fill-white sm:hidden" />
                  <Play size={20} className="hidden fill-white sm:block" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 sm:text-base">
                    Watch Video Tutorial
                  </p>
                  <p className="text-[11px] text-slate-500 sm:text-xs">
                    Learn how to prepare this dish
                  </p>
                </div>
                <ArrowLeft
                  size={18}
                  className="rotate-180 text-slate-400 transition-transform group-hover:translate-x-1"
                />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          STICKY BOTTOM BAR (Mobile only)
          ═══════════════════════════════════════════════ */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] leading-none text-slate-500">Total</p>
            <p className="mt-0.5 text-base font-black leading-none text-slate-900">
              Rs. {finalPrice * qty}
            </p>
          </div>

          <div className="ml-auto inline-flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="flex h-10 w-9 items-center justify-center text-slate-500 active:bg-slate-100"
              aria-label="Decrease"
            >
              <Minus size={14} />
            </button>
            <span className="flex h-10 w-8 items-center justify-center border-x border-slate-200 text-sm font-bold text-slate-900">
              {qty}
            </span>
            <button
              onClick={() => setQty(qty + 1)}
              className="flex h-10 w-9 items-center justify-center text-slate-500 active:bg-slate-100"
              aria-label="Increase"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={handleBuyNow}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 active:bg-orange-50"
          >
            <Zap size={14} className="text-emerald-500" fill="currentColor" />
            Buy
          </button>

          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 ${
              added
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                : "bg-gradient-to-r from-orange-500 to-red-500"
            }`}
          >
            {added ? (
              <>
                <Check size={14} /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={14} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}