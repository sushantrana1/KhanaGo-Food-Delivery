import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  ChefHat,
  Truck,
  Package,
  XCircle,
  MapPin,
  RefreshCw,
  Loader2,
  Zap,
  Home,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { trackOrder } from "../services/orderApi.js";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

/* ═══════════════════════════════════════════════════════
   STATUS CONFIG
   ═══════════════════════════════════════════════════════ */

const STEP_ICONS = {
  pending: Clock,
  confirmed: CheckCircle2,
  preparing: ChefHat,
  out_for_delivery: Truck,
  delivered: Home,
};

const STATUS_INFO = {
  pending: { label: "Order Placed", desc: "We've received your order", color: "amber" },
  confirmed: { label: "Confirmed", desc: "Restaurant is preparing it", color: "blue" },
  preparing: { label: "Preparing", desc: "Your food is being cooked", color: "indigo" },
  out_for_delivery: { label: "Out for Delivery", desc: "Rider is on the way", color: "purple" },
  delivered: { label: "Delivered", desc: "Enjoy your meal!", color: "emerald" },
};

/* ═══════════════════════════════════════════════════════
   INLINE SKELETON
   ═══════════════════════════════════════════════════════ */

function OrderTrackingSkeleton() {
  return (
    <div className="container py-5 sm:py-7">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="skeleton h-5 w-32 rounded" />
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchTracking = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await trackOrder(id);
      setData(res.data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    trackOrder(id)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <OrderTrackingSkeleton />;
  if (error) return <ErrorMessage message={error} />;
  if (!data)
    return (
      <div className="container py-20 text-center">
        <p className="text-slate-500">Order not found</p>
      </div>
    );

  const order = data.order;
  const cancelled = data.cancelled;
  const currentStatus = order.orderStatus;
  const statusInfo = STATUS_INFO[currentStatus] || STATUS_INFO.pending;

  // Progress percent
  const completedSteps = data.timeline.filter((s) => s.completed).length;
  const progressPct = cancelled
    ? 0
    : Math.round((completedSteps / data.timeline.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-24 sm:pb-10">
      <div className="container py-5 sm:py-7">
        <div className="mx-auto max-w-3xl">

          {/* ── Back ── */}
          <button
            onClick={() => navigate(`/orders/${id}`)}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-orange-500 sm:mb-6"
          >
            <ArrowLeft size={16} /> Back to Order
          </button>

          {/* ═══ HEADER CARD ═══ */}
          <div className="mb-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sm:mb-6">
            {/* Gradient header */}
            <div
              className={`relative px-4 py-5 sm:px-6 sm:py-6 ${
                cancelled
                  ? "bg-gradient-to-r from-red-500 to-rose-500"
                  : "bg-gradient-to-r from-orange-500 via-orange-500 to-red-500"
              }`}
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white blur-3xl" />
                <div className="absolute -bottom-10 right-0 h-40 w-40 rounded-full bg-yellow-200 blur-3xl" />
              </div>

              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/20 px-2.5 py-1 backdrop-blur-sm">
                    <Sparkles size={10} className="text-white" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                      Live Tracking
                    </span>
                  </div>
                  <h1 className="truncate text-xl font-black text-white sm:text-2xl">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </h1>
                  <p className="mt-0.5 text-xs text-white/80 sm:text-sm">
                    {new Date(order.createdAt).toLocaleString("en-US", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Refresh */}
                <button
                  onClick={() => fetchTracking(true)}
                  disabled={refreshing}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-60 sm:h-10 sm:w-10"
                  aria-label="Refresh"
                >
                  <RefreshCw
                    size={15}
                    className={refreshing ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>

            {/* Status + Progress */}
            {!cancelled && (
              <div className="p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                      Current Status
                    </p>
                    <p className="mt-0.5 truncate text-base font-black text-slate-900 sm:text-lg">
                      {statusInfo.label}
                    </p>
                    <p className="text-[11px] text-slate-500 sm:text-xs">
                      {statusInfo.desc}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                      Progress
                    </p>
                    <p className="mt-0.5 text-lg font-black text-orange-500 sm:text-xl">
                      {progressPct}%
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cancelled banner */}
            {cancelled && (
              <div className="flex items-start gap-3 p-4 sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <XCircle size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-700 sm:text-base">
                    Order Cancelled
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
                    This order was cancelled and will not be delivered.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ═══ TIMELINE ═══ */}
          {!cancelled && (
            <div className="mb-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sm:mb-6">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Package size={16} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                    Order Timeline
                  </h2>
                  <p className="text-[11px] text-slate-500 sm:text-xs">
                    Follow your order step by step
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-5 top-2 h-[calc(100%-1rem)] w-0.5 bg-slate-100 sm:left-6" />
                  {/* Progress line */}
                  <div
                    className="absolute left-5 top-2 w-0.5 bg-gradient-to-b from-orange-500 to-red-500 transition-all duration-1000 sm:left-6"
                    style={{
                      height: `calc((100% - 1rem) * ${progressPct / 100})`,
                    }}
                  />

                  <div className="space-y-5">
                    {data.timeline.map((step) => {
                      const Icon = STEP_ICONS[step.status] || Circle;
                      const isCompleted = step.completed;
                      const isCurrent = step.current;

                      return (
                        <div
                          key={step.status}
                          className="relative flex items-start gap-4"
                        >
                          {/* Icon */}
                          <div
                            className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 sm:h-12 sm:w-12 ${
                              isCurrent
                                ? "scale-110 border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-300"
                                : isCompleted
                                ? "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-200"
                                : "border-slate-200 bg-white text-slate-300"
                            }`}
                          >
                            <Icon size={16} className="sm:hidden" />
                            <Icon size={18} className="hidden sm:block" />

                            {/* Pulse ring for current */}
                            {isCurrent && (
                              <span className="absolute inset-0 animate-ping rounded-full border-2 border-orange-400 opacity-60" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 pt-1.5 sm:pt-2">
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-sm font-bold sm:text-base ${
                                  isCompleted || isCurrent
                                    ? "text-slate-900"
                                    : "text-slate-400"
                                }`}
                              >
                                {step.label}
                              </p>
                              {isCurrent && (
                                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-700 sm:text-[10px]">
                                  Live
                                </span>
                              )}
                            </div>
                            {STATUS_INFO[step.status] && (
                              <p
                                className={`mt-0.5 text-[11px] sm:text-xs ${
                                  isCompleted || isCurrent
                                    ? "text-slate-500"
                                    : "text-slate-400"
                                }`}
                              >
                                {STATUS_INFO[step.status].desc}
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

          {/* ═══ DELIVERY ADDRESS ═══ */}
          {order.deliveryAddress && !cancelled && (
            <div className="mb-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sm:mb-6">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                  <MapPin size={16} className="text-orange-500" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                  Delivery Address
                </h2>
              </div>

              <div className="space-y-3 p-4 sm:p-5">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck
                    size={14}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {order.deliveryAddress.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 sm:text-xs">
                      {order.deliveryAddress.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Home
                    size={14}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />
                  <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {order.deliveryAddress.streetAddress},{" "}
                    {order.deliveryAddress.city},{" "}
                    {order.deliveryAddress.district},{" "}
                    {order.deliveryAddress.province}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══ HELP NOTE ═══ */}
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 sm:p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <Phone size={15} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 sm:text-sm">
                Need help with this order?
              </p>
              <p className="mt-0.5 text-[11px] text-slate-600 sm:text-xs">
                Call our support at{" "}
                <a
                  href="tel:+9779815631275"
                  className="font-bold underline text-orange-600"
                >
                  +977 9815631275
                </a>
              </p>
            </div>
          </div>

          {/* ═══ ACTIONS ═══ */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <Link
              to={`/orders/${id}`}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            >
              <Package size={15} />
              Order Details
            </Link>
            <Link
              to="/orders"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Zap size={15} className="fill-white" />
              All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}