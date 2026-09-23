import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Tag,
  Truck,
  ShieldCheck,
  BadgePercent,
  AlertCircle,
} from "lucide-react";
import { useCart } from "../context/CartContext.jsx";

/* =========================================================
   INLINE SKELETON
   ========================================================= */

function CartItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <div className="skeleton h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24" />
      <div className="flex-1 space-y-2.5">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-8 w-28 rounded-xl" />
      </div>
      <div className="skeleton h-5 w-16 rounded" />
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-40 sm:pb-10">
      <div className="container py-5 sm:py-7">
        <div className="mb-5 flex items-center justify-between gap-3 sm:mb-7">
          <div>
            <div className="skeleton h-7 w-40 rounded sm:h-8" />
            <div className="skeleton mt-2 h-3 w-28 rounded" />
          </div>
          <div className="skeleton h-9 w-20 rounded-xl sm:h-10 sm:w-24" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-3 lg:col-span-2">
            {[1, 2, 3].map((i) => (
              <CartItemSkeleton key={i} />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-5">
              <div className="skeleton mb-4 h-5 w-32 rounded" />
              <div className="space-y-3">
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
              </div>
              <div className="skeleton mt-5 h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function Cart() {
  const {
    cart,
    loading,
    updateCartItem,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    tax,
    total,
    itemCount,
  } = useCart();

  const [removingId, setRemovingId] = useState(null);

  const handleRemove = (mealId) => {
    setRemovingId(mealId);
    setTimeout(() => {
      removeFromCart(mealId);
      setRemovingId(null);
    }, 180);
  };

  // Loading state
  if (loading) {
    return <CartSkeleton />;
  }

  // Empty state
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-32 sm:pb-8">
        <div className="container py-8 sm:py-12">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100 shadow-inner sm:h-24 sm:w-24">
              <ShoppingCart className="text-orange-500 sm:hidden" size={36} />
              <ShoppingCart
                className="hidden text-orange-500 sm:block"
                size={44}
              />
            </div>

            <h2 className="mb-2 text-xl font-black text-slate-800 sm:text-2xl">
              Your cart is empty
            </h2>
            <p className="mb-6 text-sm text-slate-500 sm:text-base">
              Looks like you haven&apos;t added any meals yet. Let&apos;s find
              something delicious!
            </p>

            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:px-7 sm:py-3.5 sm:text-base"
            >
              <ShoppingCart size={18} />
              Browse Meals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Cart with items
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-40 sm:pb-10">
      <div className="container py-5 sm:py-7">
        {/* Page Header */}
        <div className="mb-5 flex items-center justify-between gap-3 sm:mb-7">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Your Cart
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <Trash2 size={14} />
            Clear
          </button>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {/* LEFT: ITEMS */}
          <div className="space-y-3 sm:space-y-4 lg:col-span-2">
            {cart.items.map((item) => (
              <div
                key={item.mealId}
                className={`group relative flex gap-3 overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-300 hover:border-orange-100 hover:shadow-md sm:gap-4 sm:p-4 ${
                  removingId === item.mealId
                    ? "scale-95 opacity-0"
                    : "scale-100 opacity-100"
                }`}
              >
                {/* Image */}
                <Link
                  to={`/meals/${item.mealId}`}
                  className="block shrink-0 overflow-hidden rounded-xl bg-slate-100"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 object-cover transition-transform duration-300 group-hover:scale-105 sm:h-24 sm:w-24"
                  />
                </Link>

                {/* Details */}
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <Link to={`/meals/${item.mealId}`}>
                      <h3 className="line-clamp-2 text-sm font-bold text-slate-800 transition-colors hover:text-orange-600 sm:text-base">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="mt-1 text-xs font-semibold text-orange-600 sm:text-sm">
                      Rs. {item.price}
                    </p>
                  </div>

                  {/* Qty + remove */}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <button
                        onClick={() =>
                          updateCartItem(item.mealId, item.quantity - 1)
                        }
                        className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 sm:h-9 sm:w-9"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="flex h-8 w-9 items-center justify-center border-x border-slate-200 text-xs font-bold text-slate-900 sm:h-9 sm:w-10 sm:text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateCartItem(item.mealId, item.quantity + 1)
                        }
                        className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 sm:h-9 sm:w-9"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.mealId)}
                      aria-label="Remove item"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 sm:h-9 sm:w-9"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Item total (desktop) */}
                <div className="hidden shrink-0 flex-col items-end justify-between sm:flex">
                  <p className="text-base font-black text-slate-900">
                    Rs. {item.price * item.quantity}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-slate-400">
                      {item.quantity} x Rs. {item.price}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Continue shopping (desktop) */}
            <Link
              to="/search"
              className="hidden items-center gap-1.5 pt-2 text-sm font-semibold text-orange-500 transition hover:text-orange-600 sm:inline-flex"
            >
              <ArrowLeft size={15} />
              Continue Shopping
            </Link>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg shadow-orange-100/40">
                {/* Header */}
                <div className="border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Tag size={15} className="text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 sm:text-base">
                        Order Summary
                      </h3>
                      <p className="text-[11px] text-slate-500 sm:text-xs">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rows */}
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold text-slate-800">
                      Rs. {subtotal}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Truck size={13} className="text-slate-400" />
                      Delivery Fee
                    </span>
                    <span className="font-semibold text-slate-800">
                      Rs. {deliveryFee}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Tax (10%)</span>
                    <span className="font-semibold text-slate-800">
                      Rs. {tax}
                    </span>
                  </div>

                  <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900">
                      Total
                    </span>
                    <span className="text-xl font-black text-slate-900 sm:text-2xl">
                      Rs. {total}
                    </span>
                  </div>

                  {/* Checkout button */}
                  <Link
                    to="/checkout"
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:from-orange-600 hover:to-red-600 hover:shadow-xl active:scale-[0.98]"
                  >
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </Link>

                  {/* Continue shopping (mobile) */}
                  <Link
                    to="/search"
                    className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-orange-500 transition hover:text-orange-600 sm:hidden"
                  >
                    Continue Shopping
                  </Link>

                  {/* Trust badges */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                    {[
                      { icon: ShieldCheck, label: "Safe" },
                      { icon: Truck, label: "Fast" },
                      { icon: BadgePercent, label: "Best" },
                    ].map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1 rounded-lg bg-slate-50 py-2"
                      >
                        <Icon size={14} className="text-orange-500" />
                        <span className="text-[10px] font-semibold text-slate-600">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
                <AlertCircle
                  size={15}
                  className="mt-0.5 shrink-0 text-amber-500"
                />
                <p className="text-[11px] leading-relaxed text-amber-800 sm:text-xs">
                  Free delivery on orders above{" "}
                  <span className="font-bold">Rs. 1000</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR (Mobile) */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] leading-none text-slate-500">Total</p>
            <p className="mt-0.5 text-lg font-black leading-none text-slate-900">
              Rs. {total}
            </p>
          </div>

          <Link
            to="/checkout"
            className="ml-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition active:scale-95"
          >
            Checkout
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}