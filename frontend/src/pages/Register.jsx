import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
  UtensilsCrossed,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/common/Toast.jsx";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
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
    if (!form.name.trim()) errs.name = "Full name is required";
    else if (form.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters";

    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";

    if (!form.phone.trim()) errs.phone = "Phone is required";
    else if (!/^[0-9+\-\s()]{7,15}$/.test(form.phone))
      errs.phone = "Enter a valid phone number";

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
      await register(
        form.name.trim(),
        form.email.trim(),
        form.password,
        form.phone.trim()
      );
      addToast("Account created! Welcome to KhanaGo 🎉", "success");
      navigate(from, { replace: true });
    } catch (err) {
      addToast(
        err.response?.data?.message || "Registration failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Password strength ──
  const pwdStrength = (() => {
    const p = form.password;
    if (!p) return { level: 0, label: "", color: "" };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 2)
      return { level: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 3)
      return { level: 2, label: "Fair", color: "bg-amber-500" };
    if (score <= 4)
      return { level: 3, label: "Good", color: "bg-blue-500" };
    return { level: 4, label: "Strong", color: "bg-emerald-500" };
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container py-8 sm:py-12">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-orange-100/40 lg:grid-cols-2">

          {/* ═══ LEFT: Brand Panel ═══ */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 p-8 lg:flex lg:flex-col lg:justify-between lg:p-10">
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-yellow-200 blur-3xl" />
            </div>

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

            <div className="relative text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                <Sparkles size={13} className="text-yellow-200" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Join KhanaGo
                </span>
              </div>

              <h2 className="text-3xl font-black leading-tight xl:text-4xl">
                Your next meal is 3 taps away.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-orange-100">
                Create an account and start ordering from hundreds of delicious
                dishes — delivered fast.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { icon: Truck, text: "Free delivery on first order" },
                  { icon: ShieldCheck, text: "Secure & easy checkout" },
                  { icon: UtensilsCrossed, text: "Save favorites & reorder" },
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
                <UserPlus size={12} className="text-orange-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 sm:text-xs">
                  Get Started
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Create your account
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Join KhanaGo in under 30 seconds
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
                  <User size={12} className="text-orange-500" />
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="John Doe"
                    autoComplete="name"
                    className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                      errors.name
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                    <AlertCircle size={11} /> {errors.name}
                  </p>
                )}
              </div>

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

              {/* Phone */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
                  <Phone size={12} className="text-orange-500" />
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+977 98XXXXXXXX"
                    autoComplete="tel"
                    className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                      errors.phone
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                    <AlertCircle size={11} /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
                  <Lock size={12} className="text-orange-500" />
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
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

                {/* Strength indicator */}
                {form.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i <= pwdStrength.level
                              ? pwdStrength.color
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {pwdStrength.label}
                    </span>
                  </div>
                )}

                {errors.password && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                    <AlertCircle size={11} /> {errors.password}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <CheckCircle2
                  size={14}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />
                <p className="text-[11px] leading-relaxed text-slate-600 sm:text-xs">
                  By creating an account, you agree to our{" "}
                  <Link to="/" className="font-bold text-orange-600 hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/" className="font-bold text-orange-600 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
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

            {/* Login */}
            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                state={{ from }}
                className="font-bold text-orange-600 transition hover:text-orange-700 hover:underline"
              >
                Sign in
              </Link>
            </p>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 sm:text-xs">
              <ShieldCheck size={12} className="text-emerald-500" />
              Your data is encrypted & secure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}