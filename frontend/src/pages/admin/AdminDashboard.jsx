import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Clock,
  Plus,
  Trash2,
  Edit3,
  X,
  Tag,
  LayoutDashboard,
  RefreshCw,
  Search,
  CheckCircle2,
  Truck,
  ChefHat,
  XCircle,
  TrendingUp,
  Award,
  Save,
  Loader2,
  Package,
  Flame,
  Ban,
  UserCheck,
  MoreVertical,
  ChevronDown,
} from "lucide-react";

import {
  getDashboardStats,
  getUsers,
  getAdminOrders,
  getAdminDeals,
  createAdminDeal,
  updateAdminDeal,
  deleteAdminDeal,
  toggleUserStatus,
  deleteUser,
  updateOrderStatus,
} from "../../services/adminApi.js";
import { useToast } from "../../components/common/Toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";

/* =========================================================
   STATUS CONFIG
   ========================================================= */

const ORDER_STATUSES = [
  {
    key: "pending",
    label: "Pending",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
  {
    key: "confirmed",
    label: "Confirmed",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: CheckCircle2,
  },
  {
    key: "preparing",
    label: "Preparing",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    icon: ChefHat,
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Delivered",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  {
    key: "cancelled",
    label: "Cancelled",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
  },
];

const getStatusMeta = (key) =>
  ORDER_STATUSES.find((s) => s.key === key) || ORDER_STATUSES[0];

/* =========================================================
   STATUS DROPDOWN
   ========================================================= */

function StatusDropdown({ order, onUpdate, updating }) {
  const [open, setOpen] = useState(false);
  const current = getStatusMeta(order.orderStatus);
  const CurrentIcon = current.icon;

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        disabled={updating}
        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${current.color} hover:opacity-80 disabled:opacity-60`}
      >
        {updating ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <CurrentIcon size={11} />
        )}
        <span className="whitespace-nowrap">{current.label}</span>
        <ChevronDown size={11} />
      </button>

      {open && (
        <div className="absolute right-0 top-[34px] z-50 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Change status
            </p>
          </div>
          {ORDER_STATUSES.map((s) => {
            const Icon = s.icon;
            const isCurrent = s.key === order.orderStatus;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (!isCurrent) onUpdate(order._id, s.key);
                }}
                disabled={isCurrent || updating}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold transition ${
                  isCurrent
                    ? "cursor-default bg-orange-50 text-orange-700"
                    : "text-slate-700 hover:bg-slate-50"
                } disabled:opacity-60`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-md ${
                    isCurrent ? "bg-orange-100" : "bg-slate-100"
                  }`}
                >
                  <Icon size={12} />
                </span>
                <span className="flex-1">{s.label}</span>
                {isCurrent && (
                  <CheckCircle2 size={12} className="text-orange-500" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SKELETONS
   ========================================================= */

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="skeleton mb-3 h-10 w-10 rounded-xl" />
      <div className="skeleton mb-2 h-6 w-20 rounded" />
      <div className="skeleton h-3 w-24 rounded" />
    </div>
  );
}

function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div
        className="grid gap-4 border-b border-slate-100 bg-slate-50 p-4"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton h-3 w-3/4 rounded" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid gap-4 border-b border-slate-50 p-4 last:border-0"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton h-4 w-full rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function AdminDashboard() {
  const { addToast } = useToast();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    revenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orderFilter, setOrderFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // User actions
  const [actionUserId, setActionUserId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  // Order status update
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Deal form
  const [showDealForm, setShowDealForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dealForm, setDealForm] = useState({
    title: "",
    description: "",
    meal: "",
    discountPercentage: "",
    originalPrice: "",
    dealPrice: "",
    startDate: "",
    endDate: "",
    maxClaims: 100,
    badge: "Hot Deal",
    image: "",
  });

  /* ---------- Load data ---------- */
  const loadAll = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [statsRes, usersRes, ordersRes, dealsRes] = await Promise.all([
        getDashboardStats(),
        getUsers(),
        getAdminOrders(),
        getAdminDeals(),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.results || []);
      setOrders(ordersRes.data.results || []);
      setDeals(dealsRes.data.results || []);
      if (silent) addToast("Data refreshed", "success");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, []);

  // ---- FIXED click-outside for user menu ----
  useEffect(() => {
    const close = (e) => {
      // If the click target is inside a `[data-user-menu]` container, ignore
      if (e.target.closest && e.target.closest("[data-user-menu]")) return;
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* ---------- Order status update ---------- */
  const handleOrderStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);

    const prevOrder = orders.find((o) => o._id === orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, orderStatus: newStatus } : o
      )
    );

    try {
      await updateOrderStatus(orderId, newStatus);
      const meta = getStatusMeta(newStatus);
      addToast(`Order marked as ${meta.label}`, "success");

      getDashboardStats()
        .then((res) => setStats(res.data.stats))
        .catch(() => {});
    } catch (err) {
      if (prevOrder) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId
              ? { ...o, orderStatus: prevOrder.orderStatus }
              : o
          )
        );
      }
      addToast(
        err.response?.data?.message || "Failed to update status",
        "error"
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  /* ---------- Deal form ---------- */
  const resetForm = () => {
    setDealForm({
      title: "",
      description: "",
      meal: "",
      discountPercentage: "",
      originalPrice: "",
      dealPrice: "",
      startDate: "",
      endDate: "",
      maxClaims: 100,
      badge: "Hot Deal",
      image: "",
    });
    setEditingDeal(null);
    setShowDealForm(false);
  };

  const handleSubmitDeal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...dealForm,
        discountPercentage: Number(dealForm.discountPercentage),
        originalPrice: Number(dealForm.originalPrice),
        dealPrice: Number(dealForm.dealPrice),
        maxClaims: Number(dealForm.maxClaims),
        startDate: new Date(dealForm.startDate).toISOString(),
        endDate: new Date(dealForm.endDate).toISOString(),
      };
      if (editingDeal) {
        const res = await updateAdminDeal(editingDeal._id, payload);
        setDeals((prev) =>
          prev.map((d) => (d._id === editingDeal._id ? res.data.data : d))
        );
        addToast("Deal updated", "success");
      } else {
        const res = await createAdminDeal(payload);
        setDeals((prev) => [res.data.data, ...prev]);
        addToast("Deal created", "success");
      }
      resetForm();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save deal", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setDealForm({
      title: deal.title || "",
      description: deal.description || "",
      meal: deal.meal?._id || "",
      discountPercentage: deal.discountPercentage || "",
      originalPrice: deal.originalPrice || "",
      dealPrice: deal.dealPrice || "",
      startDate: deal.startDate
        ? new Date(deal.startDate).toISOString().slice(0, 16)
        : "",
      endDate: deal.endDate
        ? new Date(deal.endDate).toISOString().slice(0, 16)
        : "",
      maxClaims: deal.maxClaims || 100,
      badge: deal.badge || "Hot Deal",
      image: deal.image || "",
    });
    setShowDealForm(true);
  };

  const handleDeleteDeal = async (id) => {
    if (!window.confirm("Delete this deal?")) return;
    try {
      await deleteAdminDeal(id);
      setDeals((prev) => prev.filter((d) => d._id !== id));
      addToast("Deal deleted", "success");
    } catch (err) {
      addToast("Failed to delete deal", "error");
    }
  };

  /* ---------- User actions ---------- */
  const handleToggleBan = async (u) => {
    setActionUserId(u._id);
    setOpenMenuId(null);
    try {
      const res = await toggleUserStatus(u._id);
      setUsers((prev) =>
        prev.map((x) =>
          x._id === u._id ? { ...x, isActive: res.data.user.isActive } : x
        )
      );
      addToast(res.data.message || "User updated", "success");
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to update user",
        "error"
      );
    } finally {
      setActionUserId(null);
    }
  };

  const handleDeleteUser = async (u) => {
    setActionUserId(u._id);
    try {
      await deleteUser(u._id);
      setUsers((prev) => prev.filter((x) => x._id !== u._id));
      addToast("User deleted", "success");
      setConfirmDeleteUser(null);
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to delete user",
        "error"
      );
    } finally {
      setActionUserId(null);
    }
  };

  /* ---------- Filtering ---------- */
  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders;
    return orders.filter((o) => o.orderStatus === orderFilter);
  }, [orders, orderFilter]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  if (error) return <ErrorMessage message={error} />;

  const tabs = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingBag, count: orders.length },
    { id: "users", label: "Users", icon: Users, count: users.length },
    { id: "deals", label: "Deals", icon: Tag, count: deals.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-24 sm:pb-10">
      <div className="container py-5 sm:py-7">
        {/* HEADER */}
        <div className="mb-5 flex items-start justify-between gap-3 sm:mb-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-200 sm:h-12 sm:w-12">
              <Award size={20} className="text-white sm:hidden" />
              <Award size={22} className="hidden text-white sm:block" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Admin Dashboard
              </h1>
              <p className="text-[11px] text-slate-500 sm:text-sm">
                Manage KhanaGo in real time
              </p>
            </div>
          </div>

          <button
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-60 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* TABS */}
        <div className="mb-5 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mb-6 sm:px-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all sm:px-4 sm:text-sm ${
                  isActive
                    ? "border-orange-400 bg-orange-500 text-white shadow-md shadow-orange-200"
                    : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {loading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  {[
                    { label: "Total Users", value: stats.users, icon: Users, color: "orange" },
                    { label: "Total Orders", value: stats.orders, icon: ShoppingBag, color: "blue" },
                    { label: "Revenue", value: `Rs. ${stats.revenue?.toLocaleString() || 0}`, icon: DollarSign, color: "emerald" },
                    { label: "Pending", value: stats.pendingOrders, icon: Clock, color: "amber" },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <div
                        key={s.label}
                        className="group rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5"
                      >
                        <div
                          className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 sm:h-11 sm:w-11 ${
                            s.color === "orange"
                              ? "bg-orange-50 text-orange-500"
                              : s.color === "blue"
                              ? "bg-blue-50 text-blue-500"
                              : s.color === "emerald"
                              ? "bg-emerald-50 text-emerald-500"
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
                </>
              )}
            </div>

            {/* Recent Orders + Users */}
            <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3 sm:px-5 sm:py-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={16} className="text-orange-500" />
                    <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                      Recent Orders
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-[11px] font-bold text-orange-600 hover:underline sm:text-xs"
                  >
                    View All →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 p-4"
                      >
                        <div className="skeleton h-4 w-32 rounded" />
                        <div className="skeleton h-6 w-20 rounded-full" />
                      </div>
                    ))
                  ) : orders.length === 0 ? (
                    <div className="py-10 text-center">
                      <Package
                        className="mx-auto mb-2 text-slate-300"
                        size={28}
                      />
                      <p className="text-xs text-slate-500">No orders yet</p>
                    </div>
                  ) : (
                    orders.slice(0, 5).map((o) => {
                      const status = getStatusMeta(o.orderStatus);
                      const StatusIcon = status.icon;
                      return (
                        <Link
                          key={o._id}
                          to={`/orders/${o._id}`}
                          className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-slate-50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800">
                              #{o._id.slice(-6).toUpperCase()}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <p className="text-sm font-black text-slate-900">
                              Rs. {o.total}
                            </p>
                            <span
                              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${status.color}`}
                            >
                              <StatusIcon size={10} />
                              {status.label}
                            </span>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3 sm:px-5 sm:py-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-orange-500" />
                    <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                      Recent Users
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="text-[11px] font-bold text-orange-600 hover:underline sm:text-xs"
                  >
                    View All →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-4">
                        <div className="skeleton h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="skeleton h-3 w-32 rounded" />
                          <div className="skeleton h-3 w-40 rounded" />
                        </div>
                      </div>
                    ))
                  ) : users.length === 0 ? (
                    <div className="py-10 text-center">
                      <Users
                        className="mx-auto mb-2 text-slate-300"
                        size={28}
                      />
                      <p className="text-xs text-slate-500">No users yet</p>
                    </div>
                  ) : (
                    users.slice(0, 5).map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-sm font-bold text-white">
                          {u.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-800">
                            {u.name}
                          </p>
                          <p className="truncate text-[11px] text-slate-500">
                            {u.email}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {[
                { icon: Tag, label: "Manage Deals", action: () => setActiveTab("deals"), color: "orange" },
                { icon: Package, label: "View Orders", action: () => setActiveTab("orders"), color: "blue" },
                { icon: Users, label: "Users", action: () => setActiveTab("users"), color: "purple" },
                { icon: TrendingUp, label: "Analytics", action: () => addToast("Analytics coming soon", "info"), color: "emerald" },
              ].map(({ icon: Icon, label, action, color }) => (
                <button
                  key={label}
                  onClick={action}
                  className="group flex flex-col items-start gap-2 rounded-2xl border border-slate-100 bg-white p-3.5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-100 hover:shadow-lg sm:p-4"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${
                      color === "orange"
                        ? "bg-orange-50 text-orange-500"
                        : color === "blue"
                        ? "bg-blue-50 text-blue-500"
                        : color === "purple"
                        ? "bg-purple-50 text-purple-500"
                        : "bg-emerald-50 text-emerald-500"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <p className="text-xs font-bold text-slate-800 sm:text-sm">
                    {label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div>
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setOrderFilter("all")}
                className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  orderFilter === "all"
                    ? "border-orange-400 bg-orange-500 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-orange-200"
                }`}
              >
                All ({orders.length})
              </button>
              {ORDER_STATUSES.map((s) => {
                const count = orders.filter(
                  (o) => o.orderStatus === s.key
                ).length;
                return (
                  <button
                    key={s.key}
                    onClick={() => setOrderFilter(s.key)}
                    className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      orderFilter === s.key
                        ? "border-orange-400 bg-orange-500 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-orange-200"
                    }`}
                  >
                    {s.label} ({count})
                  </button>
                );
              })}
            </div>

            {loading ? (
              <TableSkeleton rows={6} cols={6} />
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-white py-14 text-center shadow-sm">
                <Package className="mx-auto mb-3 text-slate-300" size={36} />
                <p className="text-sm font-bold text-slate-600">
                  No orders in this filter
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          {["Order", "Customer", "Total", "Date", "Status", ""].map(
                            (h) => (
                              <th
                                key={h}
                                className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((o) => (
                          <tr
                            key={o._id}
                            className="border-t border-slate-100 transition hover:bg-slate-50"
                          >
                            <td className="px-4 py-3">
                              <p className="text-sm font-bold text-slate-800">
                                #{o._id.slice(-6).toUpperCase()}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {o.items?.length || 0} items
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-slate-800">
                                {o.deliveryAddress?.fullName ||
                                  o.user?.name ||
                                  "Guest"}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {o.deliveryAddress?.phone ||
                                  o.user?.email ||
                                  ""}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-sm font-black text-slate-900">
                              Rs. {o.total}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <StatusDropdown
                                order={o}
                                onUpdate={handleOrderStatusChange}
                                updating={updatingOrderId === o._id}
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                to={`/orders/${o._id}`}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 md:hidden">
                  {filteredOrders.map((o) => (
                    <div
                      key={o._id}
                      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                    >
                      <Link to={`/orders/${o._id}`} className="block p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900">
                              #{o._id.slice(-6).toUpperCase()}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {o.deliveryAddress?.fullName ||
                                o.user?.name ||
                                "Guest"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="shrink-0 text-base font-black text-slate-900">
                            Rs. {o.total}
                          </p>
                        </div>
                      </Link>

                      <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-3 py-2.5">
                        <StatusDropdown
                          order={o}
                          onUpdate={handleOrderStatusChange}
                          updating={updatingOrderId === o._id}
                        />
                        <Link
                          to={`/orders/${o._id}`}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition active:bg-orange-50"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div>
            <div className="relative mb-4">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {loading ? (
              <TableSkeleton rows={6} cols={6} />
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-white py-14 text-center shadow-sm">
                <Users className="mx-auto mb-3 text-slate-300" size={36} />
                <p className="text-sm font-bold text-slate-600">
                  No users found
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          {["User", "Email", "Role", "Status", "Joined", ""].map(
                            (h) => (
                              <th
                                key={h}
                                className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => {
                          const isSelf = u._id === user?._id;
                          const isAdminRow = u.role === "admin";
                          const canAct = !isSelf && !isAdminRow;

                          return (
                            <tr
                              key={u._id}
                              className="border-t border-slate-100 transition hover:bg-slate-50"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-xs font-bold text-white">
                                    {u.name?.charAt(0)?.toUpperCase() || "U"}
                                  </div>
                                  <p className="text-sm font-bold text-slate-800">
                                    {u.name}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                {u.email}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                    u.role === "admin"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                    u.isActive
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      u.isActive
                                        ? "bg-emerald-500"
                                        : "bg-red-500"
                                    }`}
                                  />
                                  {u.isActive ? "Active" : "Banned"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-500">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {canAct ? (
                                  <div
                                    className="relative inline-block"
                                    data-user-menu
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setOpenMenuId((p) =>
                                          p === u._id ? null : u._id
                                        );
                                      }}
                                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                                      aria-label="User actions"
                                    >
                                      <MoreVertical size={14} />
                                    </button>

                                    {openMenuId === u._id && (
                                      <div
                                        className="absolute right-0 top-[38px] z-50 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleToggleBan(u);
                                          }}
                                          disabled={actionUserId === u._id}
                                          className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold transition ${
                                            u.isActive
                                              ? "text-amber-600 hover:bg-amber-50"
                                              : "text-emerald-600 hover:bg-emerald-50"
                                          } disabled:opacity-50`}
                                        >
                                          {u.isActive ? (
                                            <>
                                              <Ban size={13} /> Ban User
                                            </>
                                          ) : (
                                            <>
                                              <UserCheck size={13} /> Unban User
                                            </>
                                          )}
                                        </button>

                                        <div className="h-px bg-slate-100" />

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setConfirmDeleteUser(u);
                                            setOpenMenuId(null);
                                          }}
                                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                        >
                                          <X size={13} /> Delete User
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    {isSelf ? "You" : "Admin"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 md:hidden">
                  {filteredUsers.map((u) => {
                    const isSelf = u._id === user?._id;
                    const isAdminRow = u.role === "admin";
                    const canAct = !isSelf && !isAdminRow;

                    return (
                      <div
                        key={u._id}
                        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-sm font-bold text-white">
                            {u.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-800">
                              {u.name}
                            </p>
                            <p className="truncate text-[11px] text-slate-500">
                              {u.email}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  u.role === "admin"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {u.role}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  u.isActive
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {u.isActive ? "Active" : "Banned"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {canAct && (
                          <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                            <button
                              type="button"
                              onClick={() => handleToggleBan(u)}
                              disabled={actionUserId === u._id}
                              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                u.isActive
                                  ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                  : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              } disabled:opacity-50`}
                            >
                              {u.isActive ? (
                                <>
                                  <Ban size={13} /> Ban
                                </>
                              ) : (
                                <>
                                  <UserCheck size={13} /> Unban
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setConfirmDeleteUser(u)}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                            >
                              <X size={13} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* DEALS TAB */}
        {activeTab === "deals" && (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 sm:text-xl">
                  Deals Manager
                </h2>
                <p className="text-[11px] text-slate-500 sm:text-xs">
                  {deals.length} {deals.length === 1 ? "deal" : "deals"} created
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowDealForm(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-3.5 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-lg sm:px-4 sm:text-sm"
              >
                <Plus size={15} />
                New Deal
              </button>
            </div>

            {showDealForm && (
              <div className="mb-5 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3.5 sm:px-5 sm:py-4">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-orange-500" />
                    <h3 className="text-sm font-bold text-slate-800 sm:text-base">
                      {editingDeal ? "Edit Deal" : "Create New Deal"}
                    </h3>
                  </div>
                  <button
                    onClick={resetForm}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmitDeal}
                  className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5"
                >
                  {[
                    { key: "title", label: "Title", type: "text", required: true },
                    { key: "meal", label: "Meal ID", type: "text", required: true },
                    { key: "discountPercentage", label: "Discount %", type: "number", required: true, min: 1, max: 100 },
                    { key: "originalPrice", label: "Original Price", type: "number", required: true },
                    { key: "dealPrice", label: "Deal Price", type: "number", required: true },
                    { key: "maxClaims", label: "Max Claims", type: "number" },
                    { key: "startDate", label: "Start Date", type: "datetime-local", required: true },
                    { key: "endDate", label: "End Date", type: "datetime-local", required: true },
                    { key: "badge", label: "Badge", type: "text" },
                    { key: "image", label: "Image URL", type: "text" },
                  ].map(({ key, label, type, required, min, max }) => (
                    <div key={key}>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        {label}{" "}
                        {required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={type}
                        required={required}
                        min={min}
                        max={max}
                        value={dealForm[key]}
                        onChange={(e) =>
                          setDealForm({ ...dealForm, [key]: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  ))}

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={dealForm.description}
                      onChange={(e) =>
                        setDealForm({
                          ...dealForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 sm:col-span-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] disabled:opacity-70 sm:flex-none sm:px-6"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={15} />
                          {editingDeal ? "Update Deal" : "Create Deal"}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:flex-none"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <TableSkeleton rows={5} cols={5} />
            ) : deals.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-white py-14 text-center shadow-sm">
                <Tag className="mx-auto mb-3 text-slate-300" size={36} />
                <p className="text-sm font-bold text-slate-600">
                  No deals yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Create your first deal to attract customers
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          {["Title", "Meal", "Discount", "Price", "Claims", "Ends", ""].map(
                            (h) => (
                              <th
                                key={h}
                                className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {deals.map((deal) => (
                          <tr
                            key={deal._id}
                            className="border-t border-slate-100 transition hover:bg-slate-50"
                          >
                            <td className="px-4 py-3">
                              <p className="text-sm font-bold text-slate-800">
                                {deal.title}
                              </p>
                              {deal.badge && (
                                <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                                  <Flame size={9} />
                                  {deal.badge}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {deal.meal?.name || "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
                                {deal.discountPercentage}%
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-black text-slate-900">
                                Rs. {deal.dealPrice}
                              </p>
                              <p className="text-[11px] text-slate-400 line-through">
                                Rs. {deal.originalPrice}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {deal.claimedCount}/{deal.maxClaims}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500">
                              {new Date(deal.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleEditDeal(deal)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteDeal(deal._id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 md:hidden">
                  {deals.map((deal) => (
                    <div
                      key={deal._id}
                      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                    >
                      <div className="flex gap-3 p-3.5">
                        {deal.image && (
                          <img
                            src={deal.image}
                            alt={deal.title}
                            className="h-16 w-16 shrink-0 rounded-xl object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-800">
                            {deal.title}
                          </p>
                          <p className="truncate text-[11px] text-slate-500">
                            {deal.meal?.name || "—"}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                              {deal.discountPercentage}% OFF
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Ends{" "}
                              {new Date(deal.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3.5 py-2.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-black text-slate-900">
                            Rs. {deal.dealPrice}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through">
                            Rs. {deal.originalPrice}
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEditDeal(deal)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition active:bg-orange-50"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteDeal(deal._id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition active:bg-red-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDeleteUser && (
        <>
          <div
            className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setConfirmDeleteUser(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-[110] w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <X size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                  Delete this user?
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  <span className="font-semibold">
                    {confirmDeleteUser.name}
                  </span>{" "}
                  ({confirmDeleteUser.email}) will be permanently removed. This
                  action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteUser(null)}
                disabled={actionUserId === confirmDeleteUser._id}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(confirmDeleteUser)}
                disabled={actionUserId === confirmDeleteUser._id}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-red-200 transition hover:bg-red-600 disabled:opacity-60"
              >
                {actionUserId === confirmDeleteUser._id ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}