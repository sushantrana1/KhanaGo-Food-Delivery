import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Save,
  Loader2,
  Shield,
  LogOut,
  Package,
  Heart,
  ShoppingBag,
  ChevronRight,
  Pencil,
  X,
  CheckCircle2,
  Sparkles,
  Zap,
  Award,
} from "lucide-react";

import { updateProfile } from "../services/userApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/common/Toast.jsx";

/* ═══════════════════════════════════════════════════════
   INLINE SKELETON
   ═══════════════════════════════════════════════════════ */

function ProfileSkeleton() {
  return (
    <div className="container py-5 sm:py-7">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="skeleton h-40 rounded-2xl" />
        <div className="skeleton h-28 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
      });
      setInitialLoading(false);
    }
  }, [user]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (form.phone && !/^[0-9+\-\s()]{7,15}$/.test(form.phone))
      errs.phone = "Enter a valid phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await updateProfile(form);
      updateUser(res.data.user);
      addToast("Profile updated successfully", "success");
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setIsEditing(false);
      }, 1200);
    } catch (err) {
      addToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    if (user) {
      setForm({ name: user.name || "", phone: user.phone || "" });
    }
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (initialLoading) return <ProfileSkeleton />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-24 sm:pb-10">
      <div className="container py-5 sm:py-7">
        <div className="mx-auto max-w-3xl">

          {/* ── Header ── */}
          <div className="mb-5 sm:mb-6">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              My Profile
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Manage your account & preferences
            </p>
          </div>

          {/* ═══ Simple Profile Card ═══ */}
          <div className="mb-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:items-center sm:gap-5">
                {/* Simple icon avatar (no letter) */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md shadow-orange-200 sm:h-16 sm:w-16">
                  <User size={24} className="sm:hidden" />
                  <User size={28} className="hidden sm:block" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-black text-slate-900 sm:text-xl">
                    {user.name}
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
                    {user.email}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1">
                    <Sparkles size={10} className="text-orange-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 sm:text-xs">
                      {user.role || "customer"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Stat Cards ═══ */}
          <div className="mb-5 grid grid-cols-3 gap-2.5 sm:gap-3">
            {[
              { icon: ShoppingBag, label: "Orders", color: "orange", action: () => navigate("/orders") },
              { icon: Heart, label: "Favorites", color: "red", action: () => navigate("/favorites") },
              { icon: Award, label: "Rewards", color: "amber", action: () => addToast("Rewards coming soon!", "info") },
            ].map(({ icon: Icon, label, color, action }) => (
              <button
                key={label}
                onClick={action}
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-100 hover:shadow-md sm:p-4"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 sm:h-10 sm:w-10 ${
                    color === "orange"
                      ? "bg-orange-50 text-orange-500"
                      : color === "red"
                      ? "bg-red-50 text-red-500"
                      : "bg-amber-50 text-amber-500"
                  }`}
                >
                  <Icon size={16} className="sm:hidden" />
                  <Icon size={18} className="hidden sm:block" />
                </div>
                <p className="text-xs font-bold text-slate-800 sm:text-sm">
                  {label}
                </p>
              </button>
            ))}
          </div>

          {/* ═══ Info Card with Inline Edit ═══ */}
          <div className="mb-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3.5 sm:px-5 sm:py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm sm:h-10 sm:w-10">
                  <User size={16} className="text-orange-500 sm:hidden" />
                  <User size={18} className="hidden text-orange-500 sm:block" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 sm:text-base">
                    Personal Information
                  </h3>
                  <p className="text-[11px] text-slate-500 sm:text-xs">
                    {isEditing ? "Update your details" : "Your account details"}
                  </p>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 sm:text-sm"
                >
                  <Pencil size={13} />
                  Edit
                </button>
              )}
            </div>

            {/* ── View mode ── */}
            {!isEditing ? (
              <div className="space-y-2.5 p-4 sm:space-y-3 sm:p-5">
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm sm:h-10 sm:w-10">
                    <User size={15} className="text-orange-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">
                      Full Name
                    </p>
                    <p className="truncate text-sm font-bold text-slate-800 sm:text-base">
                      {user.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm sm:h-10 sm:w-10">
                    <Mail size={15} className="text-orange-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">
                      Email
                    </p>
                    <p className="truncate text-sm font-bold text-slate-800 sm:text-base">
                      {user.email}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    Locked
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm sm:h-10 sm:w-10">
                    <Phone size={15} className="text-orange-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">
                      Phone
                    </p>
                    <p className="truncate text-sm font-bold text-slate-800 sm:text-base">
                      {user.phone || (
                        <span className="text-slate-400">Not added yet</span>
                      )}
                    </p>
                  </div>
                  {!user.phone && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 transition hover:bg-amber-200"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* ── Edit mode ── */
              <form onSubmit={submit} className="space-y-4 p-4 sm:p-5">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
                    <User size={12} className="text-orange-500" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Your name"
                    autoFocus
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                      errors.name
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-[11px] font-medium text-red-500">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
                    <Mail size={12} className="text-orange-500" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
                    <Phone size={12} className="text-orange-500" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+977 98XXXXXXXX"
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                      errors.phone
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-[11px] font-medium text-red-500">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    <X size={15} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${
                      saved
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-200"
                        : "bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-200"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Saving
                      </>
                    ) : saved ? (
                      <>
                        <CheckCircle2 size={15} />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ═══ Quick Links ═══ */}
          <div className="mb-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 sm:text-sm">
                Quick Actions
              </h3>
            </div>

            {[
              { to: "/orders", icon: Package, label: "My Orders", sub: "View your order history", color: "orange" },
              { to: "/favorites", icon: Heart, label: "Favorites", sub: "Your saved meals", color: "red" },
              { to: "/cart", icon: ShoppingBag, label: "My Cart", sub: "Continue where you left off", color: "amber" },
              { to: "/deals", icon: Zap, label: "Active Deals", sub: "Grab today's best offers", color: "purple" },
            ].map(({ to, icon: Icon, label, sub, color }, i, arr) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition-all hover:bg-orange-50/50 sm:px-5 sm:py-3.5 ${
                  i !== arr.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 sm:h-10 sm:w-10 sm:rounded-xl ${
                    color === "orange"
                      ? "bg-orange-50 text-orange-500"
                      : color === "red"
                      ? "bg-red-50 text-red-500"
                      : color === "amber"
                      ? "bg-amber-50 text-amber-500"
                      : "bg-purple-50 text-purple-500"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800">{label}</p>
                  <p className="truncate text-[11px] text-slate-500 sm:text-xs">
                    {sub}
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-orange-500"
                />
              </button>
            ))}
          </div>

          {/* ═══ Security Note ═══ */}
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <Shield size={15} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800 sm:text-sm">
                Your data is safe with us
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-700 sm:text-xs">
                All personal information is encrypted and never shared.
              </p>
            </div>
          </div>

          {/* ═══ Logout ═══ */}
          <button
            onClick={handleLogout}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition-all hover:border-red-300 hover:bg-red-100"
          >
            <LogOut
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
            Logout
          </button>

          <p className="mt-4 text-center text-[10px] text-slate-400 sm:text-xs">
            KhanaGo · Your Food, Your Way
          </p>
        </div>
      </div>
    </div>
  );
}