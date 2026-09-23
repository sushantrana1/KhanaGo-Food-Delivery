import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  Truck,
  Clock,
  CreditCard,
  MapPin,
  ArrowRight,
  Home,
  Sparkles,
  Receipt,
  ShoppingBag,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { getOrderById } from "../services/orderApi.js";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

/* =========================================================
   INLINE SKELETON
   ========================================================= */

function ConfirmationSkeleton() {
  return (
    <div className="container py-6 sm:py-10">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="skeleton mx-auto h-20 w-20 rounded-full" />
        <div className="skeleton mx-auto h-8 w-64 rounded" />
        <div className="skeleton mx-auto h-4 w-80 rounded" />
        <div className="skeleton h-64 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-12 rounded-xl" />
          <div className="skeleton h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getOrderById(orderId);
        if (!cancelled) setOrder(res.data.order);
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
  }, [orderId]);

  if (loading) return <ConfirmationSkeleton />;
  if (error) return <ErrorMessage message={error} />;
  if (!order) return <ErrorMessage message="Order not found" />;

  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  const paymentMethodLabel = {
    cod: "Cash on Delivery",
    khalti: "Khalti",
    esewa: "eSewa",
    imepay: "IME Pay",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-24 sm:pb-10">
      <div className="container py-6 sm:py-10">
        <div className="mx-auto max-w-2xl">

          {/* ===== SUCCESS HERO ===== */}
          <div className="mb-6 text-center">
            {/* Animated check circle */}
            <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
              {/* Pulse rings */}
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-200 opacity-60" />
              <span
                className="absolute inset-2 animate-ping rounded-full bg-emerald-300 opacity-40"
                style={{ animationDelay: "0.15s" }}
              />
              {/* Main circle */}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-200 sm:h-24 sm:w-24">
                <CheckCircle2
                  size={40}
                  className="text-white sm:hidden"
                  strokeWidth={2.5}
                />
                <CheckCircle2
                  size={48}
                  className="hidden text-white sm:block"
                  strokeWidth={2.5}
                />
              </div>
            </div>

            {/* Success message */}
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1">
              <Sparkles size={12} className="text-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 sm:text-xs">
                Order Confirmed
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Thank you for your order
            </h1>
            <p className="mx-auto mt-2 max-w-md px-4 text-xs leading-relaxed text-slate-500 sm:text-sm">
              We have received your order and the restaurant is preparing it.
              You will get a confirmation shortly.
            </p>
          </div>

          {/* ===== ORDER CARD ===== */}
          <div className="mb-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg shadow-orange-100/30">

            {/* Header */}
            <div className="border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3.5 sm:px-5 sm:py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Receipt size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                      Order ID
                    </p>
                    <p className="text-sm font-black text-slate-900 sm:text-base">
                      #{order._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 sm:text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Confirmed
                </span>
              </div>
            </div>

            {/* Summary rows */}
            <div className="divide-y divide-slate-100">
              <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5">
                <span className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                  <Package size={14} className="text-slate-400" />
                  Items
                </span>
                <span className="text-sm font-bold text-slate-900 sm:text-base">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5">
                <span className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                  <CreditCard size={14} className="text-slate-400" />
                  Payment Method
                </span>
                <span className="text-sm font-bold capitalize text-slate-900 sm:text-base">
                  {paymentMethodLabel[order.paymentMethod] ||
                    order.paymentMethod}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5">
                <span className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                  <Clock size={14} className="text-slate-400" />
                  Estimated Delivery
                </span>
                <span className="text-sm font-bold text-slate-900 sm:text-base">
                  30-45 min
                </span>
              </div>

              <div className="flex items-center justify-between bg-gradient-to-r from-orange-50/60 to-red-50/40 px-4 py-3.5 sm:px-5 sm:py-4">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base">
                  <Zap size={14} className="text-orange-500" />
                  Total Paid
                </span>
                <span className="text-lg font-black text-orange-600 sm:text-xl">
                  Rs. {order.total}
                </span>
              </div>
            </div>
          </div>

          {/* ===== ITEM PREVIEW ===== */}
          {order.items?.length > 0 && (
            <div className="mb-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 sm:text-sm">
                  What you ordered
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 sm:text-xs">
                  {order.items.length}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {order.items.slice(0, 3).map((item, i) => (
                  <div
                    key={`${item.mealId}-${i}`}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 shrink-0 rounded-lg border border-slate-100 object-cover sm:h-14 sm:w-14"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-500 sm:text-xs">
                        Qty {item.quantity} x Rs. {item.price}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-slate-900">
                      Rs. {item.price * item.quantity}
                    </p>
                  </div>
                ))}

                {order.items.length > 3 && (
                  <div className="px-4 py-2.5 text-center text-[11px] text-slate-500 sm:text-xs">
                    +{order.items.length - 3} more items
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== DELIVERY ADDRESS ===== */}
          {order.deliveryAddress && (
            <div className="mb-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-3.5">
                <MapPin size={15} className="text-orange-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 sm:text-sm">
                  Delivering to
                </span>
              </div>
              <div className="space-y-1 p-4 sm:p-5">
                <p className="text-sm font-bold text-slate-800 sm:text-base">
                  {order.deliveryAddress.fullName}
                </p>
                <p className="text-[11px] text-slate-500 sm:text-xs">
                  {order.deliveryAddress.phone}
                </p>
                <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {order.deliveryAddress.streetAddress},{" "}
                  {order.deliveryAddress.city},{" "}
                  {order.deliveryAddress.district},{" "}
                  {order.deliveryAddress.province}
                </p>
              </div>
            </div>
          )}

          {/* ===== WHAT'S NEXT ===== */}
          <div className="mb-5 overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-red-50/60 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                <Truck size={15} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 sm:text-sm">
                  What happens next
                </p>
                <p className="text-[10px] text-slate-500 sm:text-xs">
                  Follow your order step by step
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  icon: CheckCircle2,
                  text: "Order confirmed and sent to kitchen",
                  active: true,
                },
                {
                  icon: Package,
                  text: "Restaurant will prepare your food",
                  active: false,
                },
                {
                  icon: Truck,
                  text: "Rider picks up and delivers to you",
                  active: false,
                },
                {
                  icon: Home,
                  text: "Enjoy your delicious meal",
                  active: false,
                },
              ].map(({ icon: Icon, text, active }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      active
                        ? "bg-orange-500 text-white"
                        : "bg-white text-slate-400 shadow-sm"
                    }`}
                  >
                    <Icon size={13} />
                  </div>
                  <p
                    className={`text-xs sm:text-sm ${
                      active
                        ? "font-bold text-slate-800"
                        : "font-medium text-slate-500"
                    }`}
                  >
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ===== ACTIONS ===== */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <Link
              to={`/orders/${order._id}/track`}
              className="order-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:shadow-xl sm:order-none"
            >
              <Truck size={15} />
              Track Order
            </Link>

            <Link
              to={`/orders/${order._id}`}
              className="order-2 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 sm:order-none"
            >
              <Receipt size={15} />
              Order Details
            </Link>

            <Link
              to="/search"
              className="order-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 sm:order-none"
            >
              <ShoppingBag size={15} />
              Order More
            </Link>
          </div>

          {/* ===== TRUST NOTE ===== */}
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 sm:p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <ShieldCheck size={15} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800 sm:text-sm">
                Thanks for choosing KhanaGo
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-700 sm:text-xs">
                Your satisfaction is our priority. Need help? Call{" "}
                <a
                  href="tel:+9779815631275"
                  className="font-bold underline"
                >
                  +977 9815631275
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-[10px] text-slate-400 sm:text-xs">
            KhanaGo - Your Food, Your Way
          </p>
        </div>
      </div>
    </div>
  );
}