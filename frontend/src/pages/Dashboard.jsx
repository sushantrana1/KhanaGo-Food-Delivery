import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  CheckCircle2,
  Heart,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShoppingBag,
  Search,
  Clock,
  ChefHat,
  Truck,
  XCircle,
  Sparkles,
  Zap,
} from "lucide-react";

import { getOrders } from "../services/orderApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

/* ═══════════════════════════════════════════════════════
   STATUS CONFIG
   ═══════════════════════════════════════════════════════ */

const ORDER_STATUSES = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle2 },
  preparing: { label: "Preparing", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: ChefHat },
  out_for_delivery: { label: "On the way", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

/* ═══════════════════════════════════════════════════════
   SKELETONS
   ═══════════════════════════════════════════════════════ */

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="skeleton mb-3 h-10 w-10 rounded-xl" />
      <div className="skeleton mb-2 h-6 w-20 rounded" />
      <div className="skeleton h-3 w-24 rounded" />
    </div>
  );
}

function OrderRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3.5">
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <div className="skeleton h-3.5 w-28 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
      </div>
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container py-5 sm:py-7">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="skeleton h-32 rounded-2xl sm:h-40" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <div className="skeleton mb-4 h-5 w-32 rounded" />
          <div className="space-y-3">
            <OrderRowSkeleton />
            <OrderRowSkeleton />
            <OrderRowSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorMessage message={error} />;

  // ── Compute stats ──
  const totalSpent = orders.reduce(
    (acc, o) => acc + (o.paymentStatus === "completed" ? o.total : 0),
    0
  );
  const completed = orders.filter((o) => o.orderStatus === "delivered").length;
  const activeOrders = orders.filter((o) =>
    ["pending", "confirmed", "preparing", "out_for_delivery"].includes(
      o.orderStatus
    )
  ).length;

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "orange" },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "emerald" },
    { label: "Active", value: activeOrders, icon: TrendingUp, color: "blue" },
    { label: "Total Spent", value: `Rs. ${totalSpent.toLocaleString()}`, icon: DollarSign, color: "amber" },
  ];

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-24 sm:pb-10">
      <div className="container py-5 sm:py-7">
        <div className="mx-auto max-w-4xl">

          {/* ═══ WELCOME BANNER ═══ */}
          <div className="relative mb-5 overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 shadow-lg shadow-orange-200/50 sm:mb-6">
            {/* Blur blobs */}
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white blur-3xl" />
              <div className="absolute -bottom-10 right-0 h-40 w-40 rounded-full bg-yellow-200 blur-3xl" />
            </div>

            {/* Sparkles */}
            <Sparkles
              size={14}
              className="absolute right-6 top-6 text-white/60 sm:hidden"
            />
            <Sparkles
              size={18}
              className="absolute right-8 top-8 hidden text-white/60 sm:block"
            />

            <div className="relative p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/20 px-2.5 py-1 backdrop-blur-sm">
                    <Sparkles size={10} className="text-yellow-200" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white sm:text-xs">
                      Welcome back
                    </span>
                  </div>
                  <h1 className="truncate text-2xl font-black leading-tight text-white sm:text-3xl">
                    Hi {firstName} 👋
                  </h1>
                  <p className="mt-1.5 text-xs text-orange-100 sm:text-sm">
                    {orders.length === 0
                      ? "Ready to place your first order?"
                      : `${orders.length} ${orders.length === 1 ? "order" : "orders"} placed so far. Keep it up!`}
                  </p>
                </div>

                {/* Quick browse button */}
                <Link
                  to="/search"
                  className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-orange-600 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:flex"
                >
                  <Search size={14} />
                  Browse
                </Link>
              </div>

              {/* Mobile browse button */}
              <Link
                to="/search"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-white/95 px-4 py-2.5 text-sm font-bold text-orange-600 shadow-md transition active:scale-95 sm:hidden"
              >
                <Search size={14} />
                Browse Meals
              </Link>
            </div>
          </div>

          {/* ═══ STAT CARDS ═══ */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:mb-6 sm:grid-cols-4 sm:gap-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="group rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-4"
                >
                  <div
                    className={`mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 sm:h-11 sm:w-11 ${
                      s.color === "orange"
                        ? "bg-orange-50 text-orange-500"
                        : s.color === "emerald"
                        ? "bg-emerald-50 text-emerald-500"
                        : s.color === "blue"
                        ? "bg-blue-50 text-blue-500"
                        : "bg-amber-50 text-amber-500"
                    }`}
                  >
                    <Icon size={18} className="sm:hidden" />
                    <Icon size={20} className="hidden sm:block" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                    {s.label}
                  </p>
                  <p className="mt-0.5 truncate text-lg font-black text-slate-900 sm:text-2xl">
                    {s.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ═══ QUICK ACTIONS ═══ */}
          <div className="mb-5 grid grid-cols-2 gap-2.5 sm:mb-6 sm:grid-cols-4 sm:gap-3">
            {[
              { to: "/orders", icon: Package, label: "Orders", color: "orange" },
              { to: "/favorites", icon: Heart, label: "Favorites", color: "red" },
              { to: "/deals", icon: Zap, label: "Deals", color: "purple" },
              { to: "/profile", icon: TrendingUp, label: "Profile", color: "emerald" },
            ].map(({ to, icon: Icon, label, color }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-3 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-100 hover:shadow-md"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${
                    color === "orange"
                      ? "bg-orange-50 text-orange-500"
                      : color === "red"
                      ? "bg-red-50 text-red-500"
                      : color === "purple"
                      ? "bg-purple-50 text-purple-500"
                      : "bg-emerald-50 text-emerald-500"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <span className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                  {label}
                </span>
              </Link>
            ))}
          </div>

          {/* ═══ RECENT ORDERS ═══ */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3 sm:px-5 sm:py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Package size={15} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                    Recent Orders
                  </h2>
                  <p className="text-[10px] text-slate-500 sm:text-xs">
                    Your latest activity
                  </p>
                </div>
              </div>

              {orders.length > 0 && (
                <Link
                  to="/orders"
                  className="flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:underline sm:text-xs"
                >
                  View All <ArrowRight size={11} />
                </Link>
              )}
            </div>

            {/* Empty */}
            {orders.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100">
                  <ShoppingBag className="text-orange-500" size={28} />
                </div>
                <h3 className="mb-1.5 text-base font-bold text-slate-700 sm:text-lg">
                  No orders yet
                </h3>
                <p className="mx-auto mb-5 max-w-xs px-4 text-xs text-slate-500 sm:text-sm">
                  Start exploring our menu and place your first order!
                </p>
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Search size={15} />
                  Browse Meals
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => {
                  const status =
                    ORDER_STATUSES[order.orderStatus] ||
                    ORDER_STATUSES.pending;
                  const StatusIcon = status.icon;
                  const itemCount = order.items?.reduce(
                    (sum, i) => sum + i.quantity,
                    0
                  ) || 0;

                  return (
                    <Link
                      key={order._id}
                      to={`/orders/${order._id}`}
                      className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50 sm:px-5"
                    >
                      {/* Icon */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${status.color}`}
                      >
                        <StatusIcon size={16} />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-orange-600 sm:text-base">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          · {itemCount} {itemCount === 1 ? "item" : "items"}
                        </p>
                      </div>

                      {/* Price + status */}
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-slate-900 sm:text-base">
                          Rs. {order.total}
                        </p>
                        <span
                          className={`mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold sm:text-[10px] ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* Arrow */}
                      <ArrowRight
                        size={16}
                        className="hidden shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500 sm:block"
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* ═══ MOBILE BROWSE CTA ═══ */}
          {orders.length > 0 && (
            <Link
              to="/search"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-orange-600 transition hover:border-orange-200 hover:bg-orange-50 sm:hidden"
            >
              <Search size={16} />
              Order More Meals
            </Link>
          )}

          <p className="mt-6 text-center text-[10px] text-slate-400 sm:text-xs">
            KhanaGo · Your Food, Your Way
          </p>
        </div>
      </div>
    </div>
  );
}