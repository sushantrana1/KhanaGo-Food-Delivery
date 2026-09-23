import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingCart,
  User,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Package,
  UtensilsCrossed,
  Tag,
  Home,
  Flame,
  Grid3x3,
  Shield,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import useNotifications from "../../hooks/useNotifications.js";
import NotificationBell from "../common/NotificationBell.jsx";
import { getAdminOrders } from "../../services/adminApi.js";
import { getOrders } from "../../services/orderApi.js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef(null);
  const location = useLocation();

  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const notif = useNotifications();

  const isAdmin = user?.role === "admin";
  const dashboardPath = isAdmin ? "/admin" : "/dashboard";
  const dashboardLabel = isAdmin ? "Admin Panel" : "Dashboard";

  /* =========================================================
     Notifications polling (persisted in localStorage)
     ========================================================= */
  const seenOrdersRef = useRef(null);

  // Initialize from localStorage so state survives refresh
  if (seenOrdersRef.current === null) {
    try {
      const raw = localStorage.getItem("khanago_seen_orders");
      seenOrdersRef.current = new Set(raw ? JSON.parse(raw) : []);
    } catch {
      seenOrdersRef.current = new Set();
    }
  }

  const persistSeen = () => {
    try {
      localStorage.setItem(
        "khanago_seen_orders",
        JSON.stringify([...seenOrdersRef.current])
      );
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const poll = async () => {
      try {
        if (isAdmin) {
          // Admin: watch for new orders
          const res = await getAdminOrders();
          const orders = res.data?.results || [];
          const latest = orders.slice(0, 10);

          const isFirstPoll = seenOrdersRef.current.size === 0;

          latest.forEach((o) => {
            if (!seenOrdersRef.current.has(o._id)) {
              seenOrdersRef.current.add(o._id);
              if (!cancelled && !isFirstPoll) {
                notif.push({
                  title: "New order received",
                  body: `Order #${o._id
                    .slice(-6)
                    .toUpperCase()} · Rs. ${o.total} · ${
                    o.deliveryAddress?.fullName || "Guest"
                  }`,
                  link: "/admin",
                  type: "new_order",
                });
              }
            }
          });

          persistSeen();
        } else {
          // Customer: watch for status changes on own orders
          const res = await getOrders();
          const orders = res.data?.results || [];

          const isFirstPoll = seenOrdersRef.current.size === 0;

          orders.forEach((o) => {
            const key = `${o._id}:${o.orderStatus}`;

            // Find previous status key for this order
            const prevKey = [...seenOrdersRef.current].find((k) =>
              k.startsWith(`${o._id}:`)
            );

            if (!seenOrdersRef.current.has(key)) {
              seenOrdersRef.current.add(key);

              // Remove the old status key for this order
              if (prevKey) seenOrdersRef.current.delete(prevKey);

              if (!cancelled && prevKey && !isFirstPoll) {
                notif.push({
                  title: "Order status updated",
                  body: `Order #${o._id
                    .slice(-6)
                    .toUpperCase()} is now ${o.orderStatus.replace(
                    /_/g,
                    " "
                  )}`,
                  link: `/orders/${o._id}`,
                  type: "order_status",
                });
              }
            }
          });

          persistSeen();
        }
      } catch {
        /* silent */
      }
    };

    poll();
    const interval = setInterval(poll, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [user, isAdmin]);

  /* =========================================================
     Misc UI effects
     ========================================================= */
  useEffect(() => {
    setOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Categories", path: "/categories", icon: Grid3x3 },
    { name: "Explore", path: "/search", icon: Search },
    { name: "Deals", path: "/deals", icon: Flame },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setOpen(false);
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-slate-200/70 bg-white/85 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-white/70 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3 sm:h-[72px] sm:gap-6">
            {/* Logo */}
            <Link
              to="/"
              className="group flex shrink-0 items-center gap-2.5 sm:gap-3"
            >
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 text-white shadow-md shadow-orange-200 transition duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-orange-300 sm:h-11 sm:w-11 sm:rounded-2xl">
                <UtensilsCrossed size={20} strokeWidth={2.5} />
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-yellow-300" />
              </div>

              <div className="leading-none">
                <div className="text-[17px] font-extrabold leading-none tracking-tight text-slate-900 sm:text-[18px]">
                  Khana<span className="text-orange-500">Go</span>
                </div>
                <div className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 sm:block">
                  Your Food · Your Way
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden items-center rounded-full bg-slate-100/80 p-1 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}

              {/* Orders — hidden for admin */}
              {user && !isAdmin && (
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                    }`
                  }
                >
                  Orders
                </NavLink>
              )}
            </div>

            {/* Desktop actions */}
            <div className="hidden items-center gap-1 md:flex">
              <Link
                to="/search"
                className="group flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
                aria-label="Search"
              >
                <Search
                  size={20}
                  className="transition-transform group-hover:scale-110"
                />
              </Link>

              {user && <NotificationBell {...notif} />}

              {!isAdmin && (
                <Link
                  to="/favorites"
                  className="group flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-red-50 hover:text-red-500"
                  aria-label="Favorites"
                >
                  <Heart
                    size={20}
                    className="transition-transform group-hover:scale-110"
                  />
                </Link>
              )}

              {!isAdmin && (
                <Link
                  to="/cart"
                  className="group relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
                  aria-label="Shopping cart"
                >
                  <ShoppingCart
                    size={20}
                    className="transition-transform group-hover:scale-110"
                  />
                  {itemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-white bg-orange-500 px-1 text-[9px] font-bold text-white shadow-sm">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </Link>
              )}

              <div className="mx-2 h-7 w-px bg-slate-200" />

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition hover:border-orange-200 hover:bg-orange-50"
                  >
                    <div className="relative">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm">
                        {user.name?.charAt(0)?.toUpperCase() || (
                          <User size={16} />
                        )}
                      </div>
                      {isAdmin && (
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-purple-500">
                          <Shield
                            size={7}
                            className="text-white"
                            fill="white"
                          />
                        </span>
                      )}
                    </div>
                    <span className="max-w-[100px] truncate text-sm font-semibold text-slate-700">
                      {user.name}
                    </span>
                    <ChevronDown
                      size={15}
                      className={`text-slate-400 transition-transform ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-[52px] w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/70">
                      <div className="mb-2 border-b border-slate-100 px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {user.name}
                          </p>
                          {isAdmin && (
                            <span className="shrink-0 rounded-full bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-purple-700">
                              Admin
                            </span>
                          )}
                        </div>
                        {user.email && (
                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {user.email}
                          </p>
                        )}
                      </div>

                      {/* Dashboard / Admin Panel */}
                      <Link
                        to={dashboardPath}
                        onClick={() => setUserMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          isAdmin
                            ? "text-purple-700 hover:bg-purple-50"
                            : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                        }`}
                      >
                        {isAdmin ? (
                          <Shield size={17} />
                        ) : (
                          <LayoutDashboard size={17} />
                        )}
                        <span className="flex-1">{dashboardLabel}</span>
                        {isAdmin && (
                          <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-purple-700">
                            Admin
                          </span>
                        )}
                      </Link>

                      {/* Profile — for customers only */}
                      {!isAdmin && (
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
                        >
                          <User size={17} /> Profile
                        </Link>
                      )}

                      {/* My Orders — for customers only */}
                      {!isAdmin && (
                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Package size={17} /> My Orders
                        </Link>
                      )}

                      {/* Cart — for customers only */}
                      {!isAdmin && (
                        <Link
                          to="/cart"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
                        >
                          <ShoppingCart size={17} />
                          <span className="flex-1">Cart</span>
                          {itemCount > 0 && (
                            <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                              {itemCount}
                            </span>
                          )}
                        </Link>
                      )}

                      {/* Favorites — for customers only */}
                      {!isAdmin && (
                        <Link
                          to="/favorites"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Heart size={17} /> Favorites
                        </Link>
                      )}

                      {/* Profile — for admin */}
                      {isAdmin && (
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
                        >
                          <User size={17} /> Profile
                        </Link>
                      )}

                      <div className="my-2 h-px bg-slate-100" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
                      >
                        <LogOut size={17} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="ml-1 flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200"
                >
                  <User size={17} /> Login
                </Link>
              )}
            </div>

            {/* Mobile actions */}
            <div className="flex items-center gap-2 md:hidden">
              <Link
                to="/search"
                className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 transition hover:border-orange-200 hover:bg-orange-50"
                aria-label="Search"
              >
                <Search size={16} className="text-slate-400" />
                <span className="max-w-[100px] truncate">Search…</span>
              </Link>

              {user && <NotificationBell {...notif} />}

              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-orange-50 hover:text-orange-500"
                aria-label="Toggle menu"
                aria-expanded={open}
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-[60] h-full w-[45%] min-w-[180px] max-w-[260px] transform overflow-y-auto border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3">
          <span className="text-sm font-extrabold tracking-tight text-slate-900">
            Khana<span className="text-orange-500">Go</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-orange-50 hover:text-orange-500"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3 py-3">
          {user ? (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-xs font-bold text-white shadow-sm">
                {user.name?.charAt(0)?.toUpperCase() || <User size={14} />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-900">
                  {user.name}
                </p>
                {isAdmin && (
                  <span className="mt-0.5 inline-block rounded-full bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-purple-700">
                    Admin
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-3 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 p-3">
              <p className="text-xs font-bold text-slate-900">
                Welcome to <span className="text-orange-600">KhanaGo</span>
              </p>
            </div>
          )}

          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                      isActive
                        ? "bg-orange-50 text-orange-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={15} />
                  {item.name}
                </NavLink>
              );
            })}

            {/* Dashboard / Admin Panel (for logged-in users) */}
            {user && (
              <NavLink
                to={dashboardPath}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                    isActive
                      ? isAdmin
                        ? "bg-purple-50 text-purple-700"
                        : "bg-orange-50 text-orange-600"
                      : isAdmin
                      ? "text-purple-700 hover:bg-purple-50"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                {isAdmin ? <Shield size={15} /> : <LayoutDashboard size={15} />}
                {dashboardLabel}
              </NavLink>
            )}

            {/* Profile (customers) */}
            {user && !isAdmin && (
              <NavLink
                to="/profile"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <User size={15} /> Profile
              </NavLink>
            )}

            {/* Orders (customers) */}
            {user && !isAdmin && (
              <NavLink
                to="/orders"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Package size={15} /> My Orders
              </NavLink>
            )}

            {/* Cart (customers) */}
            {!isAdmin && (
              <NavLink
                to="/cart"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingCart size={15} /> Cart
                </span>
                {itemCount > 0 && (
                  <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </NavLink>
            )}

            {/* Favorites (customers) */}
            {!isAdmin && (
              <NavLink
                to="/favorites"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-red-50 text-red-500"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Heart size={15} /> Favorites
              </NavLink>
            )}

            {/* Profile (admin) */}
            {user && isAdmin && (
              <NavLink
                to="/profile"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <User size={15} /> Profile
              </NavLink>
            )}

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-red-500 transition hover:bg-red-50"
              >
                <LogOut size={15} /> Logout
              </button>
            )}

            {!user && (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-2.5 py-2 text-xs font-bold text-white shadow-md shadow-orange-100"
              >
                <User size={14} /> Login
              </Link>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-medium uppercase tracking-widest text-slate-400">
            <Tag size={10} />
            Fresh · Fast
          </div>
        </div>

        <div className="h-[env(safe-area-inset-bottom)]" />
      </aside>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {[
            { to: "/", icon: Home, label: "Home" },
            { to: "/deals", icon: Flame, label: "Deals" },
            ...(isAdmin
              ? []
              : [
                  {
                    to: "/cart",
                    icon: ShoppingCart,
                    label: "Cart",
                    badge: itemCount,
                  },
                ]),
            ...(isAdmin
              ? []
              : [{ to: "/orders", icon: Package, label: "Orders" }]),
            {
              to: user ? "/profile" : "/login",
              icon: User,
              label: user ? "Profile" : "Login",
            },
          ].map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition ${
                  isActive
                    ? "text-orange-600"
                    : "text-slate-400 hover:text-slate-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    {badge > 0 && (
                      <span className="absolute -right-2 -top-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-orange-500 px-1 text-[8px] font-bold text-white">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </div>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </>
  );
}