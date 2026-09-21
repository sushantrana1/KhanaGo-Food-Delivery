import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const closeMobileMenu = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setOpen(false);
  };

  const navItems = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Categories",
      path: "/categories",
    },
    {
      name: "Explore",
      path: "/search",
    },
    {
      name: "Deals",
      path: "/deals",
    },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between gap-6">

          {/* Logo */}
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-3"
          >
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-200 transition duration-300 group-hover:scale-105 group-hover:shadow-orange-300">
              <UtensilsCrossed size={21} strokeWidth={2.5} />

              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-yellow-300" />
            </div>

            <div className="hidden sm:block">
              <div className="text-[18px] font-extrabold leading-none tracking-tight text-slate-900">
                Food<span className="text-orange-500">Delivery</span>
              </div>

              <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Fresh · Fast · Delicious
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
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

            {user && (
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

          {/* Desktop Actions */}
          <div className="hidden items-center gap-1 md:flex">

            {/* Search */}
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

            {/* Favorites */}
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

            {/* Cart */}
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

            <div className="mx-2 h-7 w-px bg-slate-200" />

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition hover:border-orange-200 hover:bg-orange-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm">
                    {user.name?.charAt(0)?.toUpperCase() || (
                      <User size={16} />
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
                      <p className="truncate text-sm font-bold text-slate-900">
                        {user.name}
                      </p>

                      {user.email && (
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {user.email}
                        </p>
                      )}
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
                    >
                      <LayoutDashboard size={17} />
                      Dashboard
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Package size={17} />
                      My Orders
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
                    >
                      <User size={17} />
                      Profile
                    </Link>

                    <div className="my-2 h-px bg-slate-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-1 flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200"
              >
                <User size={17} />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1 md:hidden">

            <Link
              to="/search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-orange-50 hover:text-orange-500"
              aria-label="Search"
            >
              <Search size={20} />
            </Link>

            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-orange-50 hover:text-orange-500"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />

              {itemCount > 0 && (
                <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-orange-50 hover:text-orange-500"
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

            {/* Mobile User Header */}
            {user ? (
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 font-bold text-white shadow-sm">
                  {user.name?.charAt(0)?.toUpperCase() || (
                    <User size={18} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">
                    {user.name}
                  </p>

                  {user.email && (
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-4 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 p-4">
                <p className="font-bold text-slate-900">
                  Welcome to FoodDelivery
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Delicious food delivered to your door.
                </p>
              </div>
            )}

            <div className="space-y-1">

              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-orange-50 text-orange-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  {item.name}
                  <span className="text-slate-300">›</span>
                </NavLink>
              ))}

              <NavLink
                to="/favorites"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-red-50 text-red-500"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Heart size={18} />
                Favorites
              </NavLink>

              <NavLink
                to="/cart"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <ShoppingCart size={18} />
                  Cart
                </span>

                {itemCount > 0 && (
                  <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </NavLink>

              {user && (
                <>
                  <NavLink
                    to="/orders"
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-orange-50 text-orange-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`
                    }
                  >
                    <Package size={18} />
                    My Orders
                  </NavLink>

                  <NavLink
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-orange-50 text-orange-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`
                    }
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </NavLink>

                  <NavLink
                    to="/profile"
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-orange-50 text-orange-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`
                    }
                  >
                    <User size={18} />
                    Profile
                  </NavLink>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              )}

              {!user && (
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-orange-100"
                >
                  <User size={18} />
                  Login / Register
                </Link>
              )}
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-widest text-slate-400">
              <Tag size={12} />
              Fresh food · Fast delivery
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}