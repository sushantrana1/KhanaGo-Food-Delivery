import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChefHat,
  MapPin,
  CreditCard,
  Package,
  Phone,
  User,
  Banknote,
  AlertCircle,
  Loader2,
  Home,
  ShieldCheck,
  Calendar,
  Wallet,
} from "lucide-react";

import { getOrderById, cancelOrder } from "../services/orderApi.js";
import ErrorMessage from "../components/common/ErrorMessage.jsx";
import { useToast } from "../components/common/Toast.jsx";

/* ═══════════════════════════════════════════════════════
   STATUS CONFIG + TIMELINE
   ═══════════════════════════════════════════════════════ */

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const STATUS_BADGE = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  confirmed: "bg-blue-50 text-blue-600 border-blue-200",
  preparing: "bg-indigo-50 text-indigo-600 border-indigo-200",
  out_for_delivery: "bg-purple-50 text-purple-600 border-purple-200",
  delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

function OrderDetailsSkeleton() {
  return (
    <div className="container py-5 sm:py-7">
      <div className="skeleton mb-5 h-5 w-32 rounded" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-48 rounded-2xl" />
          <div className="skeleton h-32 rounded-2xl" />
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getOrderById(id)
      .then((res) => {
        if (!cancelled) {
          setOrder(res.data.order);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await cancelOrder(order._id);
      setOrder(res.data.order);
      addToast("Order cancelled successfully", "success");
      setShowCancelConfirm(false);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to cancel", "error");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <OrderDetailsSkeleton />;
  if (error) return <ErrorMessage message={error} />;
  if (!order) return <ErrorMessage message="Order not found" />;

  // ── Compute timeline state ──
  const currentStepIndex =
    order.orderStatus === "cancelled"
      ? -1
      : STATUS_STEPS.findIndex((s) => s.key === order.orderStatus);

  const canCancel = ["pending", "confirmed"].includes(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  const paymentMethodLabel = {
    cod: "Cash on Delivery",
    khalti: "Khalti",
    esewa: "eSewa",
    imepay: "IME Pay",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-24 sm:pb-10">
      <div className="container py-5 sm:py-7">

        {/* Back */}
        <button
          onClick={() => navigate("/orders")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-orange-500 sm:mb-6"
        >
          <ArrowLeft size={16} /> Back to Orders
        </button>

        {/* ── Header card ── */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm sm:h-12 sm:w-12">
                <Package size={18} className="text-orange-500 sm:hidden" />
                <Package size={20} className="hidden text-orange-500 sm:block" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900 sm:text-xl">
                  Order #{order._id.slice(-6).toUpperCase()}
                </h1>
                <p className="text-[11px] text-slate-500 sm:text-xs">
                  {new Date(order.createdAt).toLocaleString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold sm:text-sm ${
                STATUS_BADGE[order.orderStatus] || STATUS_BADGE.pending
              }`}
            >
              {isCancelled ? (
                <XCircle size={13} />
              ) : (
                <CheckCircle2 size={13} />
              )}
              {order.orderStatus.replace(/_/g, " ")}
            </span>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            <div className="p-3 text-center sm:p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">
                Items
              </p>
              <p className="mt-0.5 text-base font-black text-slate-900 sm:text-lg">
                {itemCount}
              </p>
            </div>
            <div className="p-3 text-center sm:p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">
                Payment
              </p>
              <p className="mt-0.5 truncate text-xs font-bold capitalize text-slate-900 sm:text-sm">
                {order.paymentMethod}
              </p>
            </div>
            <div className="p-3 text-center sm:p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">
                Total
              </p>
              <p className="mt-0.5 text-base font-black text-orange-600 sm:text-lg">
                Rs. {order.total}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">

          {/* ═══ LEFT COLUMN ═══ */}
          <div className="space-y-5 lg:col-span-2">

            {/* ── Timeline ── */}
            {!isCancelled && (
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 sm:text-base">
                    <Truck size={16} className="text-orange-500" />
                    Order Tracking
                  </h2>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-5 top-0 h-full w-0.5 bg-slate-100 sm:left-6" />

                    <div className="space-y-5">
                      {STATUS_STEPS.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const Icon = step.icon;

                        return (
                          <div
                            key={step.key}
                            className="relative flex items-start gap-4"
                          >
                            <div
                              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all sm:h-12 sm:w-12 ${
                                isCompleted
                                  ? "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-200"
                                  : "border-slate-200 bg-white text-slate-300"
                              } ${isCurrent && "animate-pulse-ring"}`}
                            >
                              <Icon size={16} className="sm:hidden" />
                              <Icon size={18} className="hidden sm:block" />
                            </div>

                            <div className="flex-1 pt-1.5 sm:pt-2">
                              <p
                                className={`text-sm font-bold sm:text-base ${
                                  isCompleted
                                    ? "text-slate-900"
                                    : "text-slate-400"
                                }`}
                              >
                                {step.label}
                              </p>
                              {isCurrent && (
                                <p className="mt-0.5 text-[11px] font-semibold text-orange-600 sm:text-xs">
                                  ● In progress
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Cancelled banner ── */}
            {isCancelled && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <XCircle size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-700 sm:text-base">
                    Order Cancelled
                  </p>
                  <p className="mt-0.5 text-[11px] text-red-600 sm:text-xs">
                    This order was cancelled. Any refunds will be processed
                    within 3-5 business days.
                  </p>
                </div>
              </div>
            )}

            {/* ── Items ── */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 sm:text-base">
                  <Package size={16} className="text-orange-500" />
                  Order Items
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 sm:text-xs">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {order.items.map((item, i) => (
                  <div
                    key={`${item.mealId}-${i}`}
                    className="flex items-center gap-3 p-3.5 sm:gap-4 sm:p-4"
                  >
                    <Link
                      to={`/meals/${item.mealId}`}
                      className="shrink-0 overflow-hidden rounded-xl bg-slate-100"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-14 w-14 object-cover transition-transform hover:scale-105 sm:h-16 sm:w-16"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/meals/${item.mealId}`}
                        className="line-clamp-2 text-sm font-bold text-slate-800 transition hover:text-orange-600 sm:text-base"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
                        Rs. {item.price} × {item.quantity}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-black text-slate-900 sm:text-base">
                      Rs. {item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Delivery Address ── */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 sm:text-base">
                  <MapPin size={16} className="text-orange-500" />
                  Delivery Address
                </h2>
              </div>

              <div className="space-y-3 p-4 sm:p-5">
                <div className="flex items-start gap-2.5">
                  <User
                    size={15}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800 sm:text-base">
                      {order.deliveryAddress.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 sm:text-xs">
                      {order.deliveryAddress.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Home
                    size={15}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />
                  <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {order.deliveryAddress.streetAddress},{" "}
                    {order.deliveryAddress.city},{" "}
                    {order.deliveryAddress.district},{" "}
                    {order.deliveryAddress.province}
                  </p>
                </div>

                {order.deliveryAddress.landmark && (
                  <div className="flex items-start gap-2.5">
                    <MapPin
                      size={15}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />
                    <p className="text-[11px] italic text-slate-500 sm:text-xs">
                      Landmark: {order.deliveryAddress.landmark}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN ═══ */}
          <div className="space-y-5 lg:col-span-1 lg:sticky lg:top-24 lg:self-start">

            {/* ── Track Order button (NEW!) ── */}
            {!isCancelled && (
              <Link
                to={`/orders/${order._id}/track`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
              >
                <Truck size={16} />
                Track Order
              </Link>
            )}

            {/* ── Payment Summary ── */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3 sm:px-5 sm:py-4">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 sm:text-base">
                  <CreditCard size={16} className="text-orange-500" />
                  Payment Summary
                </h2>
              </div>

              <div className="space-y-3 p-4 sm:p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-800">
                    Rs. {order.subtotal}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Truck size={13} className="text-slate-400" />
                    Delivery Fee
                  </span>
                  <span className="font-semibold text-slate-800">
                    Rs. {order.deliveryFee}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Tax</span>
                  <span className="font-semibold text-slate-800">
                    Rs. {order.tax}
                  </span>
                </div>

                {order.codSurcharge > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Banknote size={13} className="text-slate-400" />
                      COD Charge
                    </span>
                    <span className="font-semibold text-slate-800">
                      Rs. {order.codSurcharge}
                    </span>
                  </div>
                )}

                {order.discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600">Discount</span>
                    <span className="font-semibold text-emerald-600">
                      − Rs. {order.discount}
                    </span>
                  </div>
                )}

                <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">
                    Total
                  </span>
                  <span className="text-xl font-black text-slate-900 sm:text-2xl">
                    Rs. {order.total}
                  </span>
                </div>

                <div className="mt-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Wallet size={13} className="text-slate-400" />
                      {paymentMethodLabel[order.paymentMethod] ||
                        order.paymentMethod}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold sm:text-xs ${
                        order.paymentStatus === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.paymentStatus === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Cancel button ── */}
            {canCancel && !showCancelConfirm && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:border-red-300 hover:bg-red-100"
              >
                <XCircle size={16} />
                Cancel Order
              </button>
            )}

            {/* ── Cancel confirm ── */}
            {showCancelConfirm && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="mb-3 flex items-start gap-2.5">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-red-700">
                      Cancel this order?
                    </p>
                    <p className="mt-0.5 text-[11px] text-red-600 sm:text-xs">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={cancelling}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Keep Order
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-3 py-2.5 text-sm font-bold text-white shadow-md shadow-red-200 transition hover:bg-red-600 disabled:opacity-60"
                  >
                    {cancelling ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Cancelling
                      </>
                    ) : (
                      "Yes, Cancel"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── Help note ── */}
            <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
              <ShieldCheck
                size={15}
                className="mt-0.5 shrink-0 text-amber-500"
              />
              <p className="text-[11px] leading-relaxed text-amber-800 sm:text-xs">
                Need help with this order?{" "}
                <a
                  href="tel:+9779815631275"
                  className="font-bold underline"
                >
                  Call support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}