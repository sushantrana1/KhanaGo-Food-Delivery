import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
  UtensilsCrossed,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/common/Toast.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const from = location.state?.from || "/";

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(form.email, form.password);
      addToast("Welcome back!", "success");
      navigate(from, { replace: true });
    } catch (err) {
      addToast(err.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container py-8 sm:py-12">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-orange-100/40 lg:grid-cols-2">

          {/* ═══ LEFT: Brand Panel (desktop only) ═══ */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 p-8 lg:flex lg:flex-col lg:justify-between lg:p-10">
            {/* Blobs */}
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-yellow-200 blur-3xl" />
            </div>

            {/* Logo */}
            <div className="relative">
              <Link to="/" className="group inline-flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white/20 text-white backdrop-blur-sm">
                  <UtensilsCrossed size={22} strokeWidth={2.5} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-orange-500 bg-yellow-300" />
                </div>
                <div>
                  <div className="text-lg font-extrabold leading-none text-white">
                    Khana<span className="text-yellow-200">Go</span>
                  </div>
                  <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-orange-100">
                    Your Food · Your Way
                  </div>
                </div>
              </Link>
            </div>

            {/* Middle content */}
            <div className="relative text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                <Sparkles size={13} className="text-yellow-200" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Welcome Back
                </span>
              </div>

              <h2 className="text-3xl font-black leading-tight xl:text-4xl">
                Hungry again?
              </h2>
              <p className="mt-3 text-base leading-relaxed text-orange-100">
                Log in to pick up where you left off — your cart, favorites,
                and orders are waiting.
              </p>

              {/* Feature list */}
              <div className="mt-8 space-y-3">
                {[
                  { icon: Truck, text: "Fast 30-45 min delivery" },
                  { icon: ShieldCheck, text: "Secure payments" },
                  { icon: UtensilsCrossed, text: "Hundreds of dishes" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                      <Icon size={15} />
                    </div>
                    <span className="text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="relative text-xs text-orange-100">
              © {new Date().getFullYear()} KhanaGo · All rights reserved
            </div>
          </div>

          {/* ═══ RIGHT: Form Panel ═══ */}
          <div className="p-6 sm:p-8 lg:p-10">
            {/* Mobile logo */}
            <div className="mb-6 flex justify-center lg:hidden">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md shadow-orange-200">
                  <UtensilsCrossed size={19} strokeWidth={2.5} />
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-yellow-300" />
                </div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  Khana<span className="text-orange-500">Go</span>
                </span>
              </Link>
            </div>

            {/* Heading */}
            <div className="mb-6 sm:mb-8">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1">
                <LogIn size={12} className="text-orange-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 sm:text-xs">
                  Sign In
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Sign in to continue to KhanaGo
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
                  <Mail size={12} className="text-orange-500" />
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                      errors.email
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                    <AlertCircle size={11} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
                    <Lock size={12} className="text-orange-500" />
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-orange-600 hover:underline sm:text-xs"
                    onClick={() =>
                      addToast("Password reset coming soon", "info")
                    }
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                      errors.password
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-orange-500"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                    <AlertCircle size={11} /> {errors.password}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:from-orange-600 hover:to-red-600 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                OR
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            {/* Register */}
            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                state={{ from }}
                className="font-bold text-orange-600 transition hover:text-orange-700 hover:underline"
              >
                Create one
              </Link>
            </p>

            {/* Trust */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 sm:text-xs">
              <ShieldCheck size={12} className="text-emerald-500" />
              Secure login · Your data is protected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}