import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Tag,
  Minus,
  Plus,
  Zap,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Sparkles,
  Utensils,
} from "lucide-react";

import { getMealById } from "../services/mealApi.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../components/common/Toast.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

/* =========================================================
   INLINE SKELETON
   ========================================================= */

function BuyNowSkeleton() {
  return (
    <div className="container py-5 sm:py-7">
      <div className="mx-auto max-w-4xl">
        <div className="skeleton mb-5 h-5 w-32 rounded" />
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="skeleton aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-7 w-4/5 rounded" />
            <div className="skeleton h-4 w-2/5 rounded" />
            <div className="skeleton h-8 w-28 rounded" />
            <div className="skeleton h-11 w-full rounded-xl" />
            <div className="skeleton h-36 w-full rounded-2xl" />
            <div className="skeleton h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function BuyNow() {
  const { mealId } = useParams();
  const navigate = useNavigate();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);

  const { addToCart, clearCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getMealById(mealId);
        if (!cancelled) setMeal(res.data.results);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [mealId]);

  // Compute totals
  const price = meal?.price || 450;
  const discount = meal?.discount || 0;
  const finalPrice =
    discount > 0 ? Math.round(price * (1 - discount / 100)) : price;

  const subtotal = finalPrice * qty;
  const deliveryFee = 100;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + deliveryFee + tax;

  const handleBuyNow = async () => {
    if (buying) return;
    setBuying(true);
    try {
      await clearCart();
      await addToCart({
        mealId: meal.externalMealId,
        name: meal.name,
        image: meal.image,
        price: finalPrice,
        quantity: qty,
      });
      addToast("Added to cart. Proceeding to checkout.", "success");
      navigate("/checkout");
    } catch {
      addToast("Something went wrong. Please try again.", "error");
      setBuying(false);
    }
  };

  if (loading) return <BuyNowSkeleton />;
  if (error) return <ErrorMessage message={error} />;
  if (!meal) return <ErrorMessage message="Meal not found" />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-32 sm:pb-10">
      <div className="container py-5 sm:py-7">
        <div className="mx-auto max-w-4xl">

          {/* ---- Back ---- */}
          <Link
            to={`/meals/${mealId}`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-orange-500 sm:mb-5"
          >
            <ArrowLeft size={15} /> Back to meal
          </Link>

          {/* ---- Main grid ---- */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,42%)_1fr] lg:gap-8">

            {/* ===== LEFT: IMAGE ===== */}
            <div className="lg:sticky lg:top-24 lg:self-start lg:h-fit">
              <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg shadow-orange-100/40 sm:max-w-none sm:rounded-2xl">
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="aspect-[4/3] w-full object-cover sm:aspect-[4/3] lg:aspect-square lg:max-h-[320px]"
                />

                {/* Discount badge */}
                {discount > 0 && (
                  <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg sm:px-3 sm:py-1.5 sm:text-xs">
                    <Zap size={11} className="fill-white" />
                    {discount}% OFF
                  </div>
                )}

                {/* Time pill */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 shadow-md backdrop-blur-sm sm:px-3 sm:py-1.5">
                  <Clock size={12} className="text-orange-500" />
                  <span className="text-[11px] font-bold text-slate-800 sm:text-xs">
                    30-45 min
                  </span>
                </div>
              </div>

              {/* Trust badges (desktop only) */}
              <div className="mt-3 hidden grid-cols-3 gap-2 lg:grid">
                {[
                  { icon: Truck, label: "Fast", sub: "30-45m" },
                  { icon: ShieldCheck, label: "Safe", sub: "Hygienic" },
                  { icon: Sparkles, label: "Fresh", sub: "Today" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="rounded-lg border border-slate-100 bg-white p-2 text-center shadow-sm"
                  >
                    <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-md bg-orange-50 text-orange-500">
                      <Icon size={13} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-800">
                      {label}
                    </p>
                    <p className="text-[9px] text-slate-500">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== RIGHT: DETAILS ===== */}
            <div className="flex flex-col">

              {/* Quick Buy pill */}
              <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1">
                <Zap size={11} className="text-orange-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 sm:text-[11px]">
                  Quick Buy
                </span>
              </div>

              {/* Title */}
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                  {meal.name}
                </h1>

                {discount > 0 && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-2 py-1 text-[10px] font-bold text-white shadow-md sm:text-[11px]">
                    <Tag size={10} />
                    {discount}%
                  </span>
                )}
              </div>

              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
                <Utensils size={13} className="text-orange-500" />
                {meal.area}
                {meal.area && meal.category ? " • " : ""}
                {meal.category}
              </p>

              {/* Price */}
              <div className="mt-3 flex flex-wrap items-baseline gap-2.5">
                <span className="text-2xl font-black text-slate-900 sm:text-3xl">
                  Rs. {finalPrice}
                </span>
                {discount > 0 && (
                  <span className="text-sm font-medium text-slate-400 line-through sm:text-base">
                    Rs. {price}
                  </span>
                )}
                {discount > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 sm:text-[11px]">
                    Save Rs. {price - finalPrice}
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="mt-4">
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                  Quantity
                </label>
                <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 sm:h-10 sm:w-10"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="flex h-9 w-12 items-center justify-center border-x border-slate-200 text-sm font-black text-slate-900 sm:h-10 sm:w-14 sm:text-base">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 sm:h-10 sm:w-10"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Order summary */}
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2.5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 sm:text-xs">
                    Order Summary
                  </h3>
                </div>

                <div className="space-y-2.5 p-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-500">
                      Subtotal ({qty} {qty === 1 ? "item" : "items"})
                    </span>
                    <span className="font-semibold text-slate-800">
                      Rs. {subtotal}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Truck size={12} className="text-slate-400" />
                      Delivery Fee
                    </span>
                    <span className="font-semibold text-slate-800">
                      Rs. {deliveryFee}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-500">Tax (10%)</span>
                    <span className="font-semibold text-slate-800">
                      Rs. {tax}
                    </span>
                  </div>

                  <div className="my-2 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 sm:text-base">
                      Total
                    </span>
                    <span className="text-lg font-black text-orange-600 sm:text-xl">
                      Rs. {total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Buy button */}
              <button
                onClick={handleBuyNow}
                disabled={buying}
                className="mt-4 hidden w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:from-orange-600 hover:to-red-600 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:flex"
              >
                {buying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap size={16} className="fill-white" />
                    Buy Now — Rs. {total}
                  </>
                )}
              </button>

              {/* Trust row (mobile) */}
              <div className="mt-4 grid grid-cols-3 gap-2 sm:hidden">
                {[
                  { icon: Truck, label: "Fast", sub: "30-45m" },
                  { icon: ShieldCheck, label: "Safe", sub: "Hygienic" },
                  { icon: CheckCircle2, label: "Easy", sub: "Returns" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-100 bg-white p-2.5 text-center shadow-sm"
                  >
                    <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                      <Icon size={14} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-800">
                      {label}
                    </p>
                    <p className="text-[9px] text-slate-500">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Sticky bottom bar (mobile only) ---- */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] leading-none text-slate-500">Total</p>
            <p className="mt-0.5 text-lg font-black leading-none text-slate-900">
              Rs. {total}
            </p>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={buying}
            className="ml-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition active:scale-95 disabled:opacity-70"
          >
            {buying ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Zap size={15} className="fill-white" />
                Buy Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}