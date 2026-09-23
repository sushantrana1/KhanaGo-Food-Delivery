import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChefHat,
  ArrowRight,
  Search,
  ShoppingBag,
} from "lucide-react";

import { getOrders } from "../services/orderApi.js";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

/* ═══════════════════════════════════════════════════════
   INLINE SKELETON
   ═══════════════════════════════════════════════════════ */

function OrderCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="skeleton h-12 w-12 shrink-0 rounded-xl sm:h-14 sm:w-14" />
          <div className="space-y-2">
            <div className="skeleton h-4 w-28 rounded" />
            <div className="skeleton h-3 w-24 rounded" />
          </div>
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="mt-3 flex gap-2 overflow-hidden">
        <div className="skeleton h-10 w-10 rounded-lg" />
        <div className="skeleton h-10 w-10 rounded-lg" />
        <div className="skeleton h-10 w-10 rounded-lg" />
      </div>
      <div className="mt-3 flex justify-between border-t border-slate-100 pt-3">
        <div className="skeleton h-5 w-20 rounded" />
        <div className="skeleton h-5 w-24 rounded" />
      </div>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      {[1, 2, 3].map((i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STATUS CONFIG
   ═══════════════════════════════════════════════════════ */

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  preparing: {
    label: "Preparing",
    icon: ChefHat,
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: Truck,
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    let cancelled = false;
    getOrders()
      .then((res) => {
        if (!cancelled) setOrders(res.data.results || []);
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
  }, []);

  // ── Filter tabs ──
  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    if (activeTab === "active") {
      return orders.filter((o) =>
        ["pending", "confirmed", "preparing", "out_for_delivery"].includes(
          o.orderStatus
        )
      );
    }
    if (activeTab === "delivered") {
      return orders.filter((o) => o.orderStatus === "delivered");
    }
    if (activeTab === "cancelled") {
      return orders.filter((o) => o.orderStatus === "cancelled");
    }
    return orders;
  }, [orders, activeTab]);

  // ── Counts for tabs ──
  const counts = useMemo(() => {
    return {
      all: orders.length,
      active: orders.filter((o) =>
        ["pending", "confirmed", "preparing", "out_for_delivery"].includes(
          o.orderStatus
        )
      ).length,
      delivered: orders.filter((o) => o.orderStatus === "delivered").length,
      cancelled: orders.filter((o) => o.orderStatus === "cancelled").length,
    };
  }, [orders]);

  if (error) return <ErrorMessage message={error} />;

  const tabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "active", label: "Active", count: counts.active },
    { id: "delivered", label: "Delivered", count: counts.delivered },
    { id: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-24 sm:pb-10">
      <div className="container py-5 sm:py-7">

        {/* ── Header ── */}
        <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              My Orders
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              {loading
                ? "Loading your orders..."
                : `${orders.length} ${orders.length === 1 ? "order" : "orders"} total`}
            </p>
          </div>

          <Link
            to="/search"
            className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 sm:flex"
          >
            <Search size={15} />
            Order More
          </Link>
        </div>

        {/* ── Filter Tabs ── */}
        {!loading && orders.length > 0 && (
          <div className="mb-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mb-5 sm:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
                  activeTab === tab.id
                    ? "border-orange-400 bg-orange-500 text-white shadow-md shadow-orange-200"
                    : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                    activeTab === tab.id
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && <OrdersSkeleton />}

        {/* ── Empty (no orders at all) ── */}
        {!loading && orders.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white py-14 text-center shadow-sm sm:py-20">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100 sm:h-24 sm:w-24">
              <ShoppingBag
                className="text-orange-500 sm:hidden"
                size={36}
              />
              <ShoppingBag
                className="hidden text-orange-500 sm:block"
                size={44}
              />
            </div>
            <h3 className="mb-2 text-lg font-black text-slate-800 sm:text-2xl">
              No orders yet
            </h3>
            <p className="mx-auto mb-6 max-w-sm px-4 text-sm text-slate-500 sm:text-base">
              Start exploring our menu and place your first order!
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:px-7 sm:text-base"
            >
              <ShoppingBag size={18} />
              Browse Meals
            </Link>
          </div>
        )}

        {/* ── Empty (filter result empty) ── */}
        {!loading &&
          orders.length > 0 &&
          filteredOrders.length === 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white py-12 text-center shadow-sm sm:py-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Package className="text-slate-400" size={28} />
              </div>
              <h3 className="mb-2 text-base font-bold text-slate-700 sm:text-lg">
                No {activeTab} orders
              </h3>
              <p className="text-xs text-slate-500 sm:text-sm">
                Try a different filter to see more orders.
              </p>
            </div>
          )}

        {/* ── Orders list ── */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            {filteredOrders.map((order) => {
              const status =
                STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;
              const itemCount = order.items.reduce(
                (sum, i) => sum + i.quantity,
                0
              );

              return (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-100 hover:shadow-lg"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${status.bg}`}
                      >
                        <StatusIcon
                          size={18}
                          className={status.text}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900 sm:text-base">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}{" "}
                          · {itemCount}{" "}
                          {itemCount === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-base font-black text-slate-900 sm:text-lg">
                        Rs. {order.total}
                      </p>
                      <span
                        className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold sm:px-2.5 sm:py-1 sm:text-xs ${status.bg} ${status.text} ${status.border}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                        />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Item previews */}
                  <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 sm:gap-3 sm:px-5">
                    {order.items.slice(0, 5).map((item, i) => (
                      <img
                        key={`${item.mealId}-${i}`}
                        src={item.image}
                        alt={item.name}
                        className="h-11 w-11 shrink-0 rounded-lg border border-slate-100 object-cover sm:h-12 sm:w-12"
                      />
                    ))}
                    {order.items.length > 5 && (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-500 sm:h-12 sm:w-12 sm:text-xs">
                        +{order.items.length - 5}
                      </div>
                    )}
                  </div>

                  {/* Bottom bar */}
                  <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 sm:px-5 sm:py-3">
                    <p className="truncate text-[11px] text-slate-500 sm:text-xs">
                      {order.items[0]?.name}
                      {order.items.length > 1 &&
                        ` +${order.items.length - 1} more`}
                    </p>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-orange-600 transition group-hover:gap-2 sm:text-sm">
                      View <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Mobile Order More ── */}
        {!loading && orders.length > 0 && (
          <Link
            to="/search"
            className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-orange-600 transition hover:border-orange-200 hover:bg-orange-50 sm:hidden"
          >
            <Search size={16} />
            Order More
          </Link>
        )}
      </div>
    </div>
  );
}