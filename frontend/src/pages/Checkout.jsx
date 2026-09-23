import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CreditCard,
  MapPin,
  Wallet,
  Banknote,
  Smartphone,
  ShieldCheck,
  Truck,
  Loader2,
  User,
  Phone,
  Building2,
  Home,
  AlertCircle,
  ChevronLeft,
  Lock,
  CheckCircle2,
} from "lucide-react";

import { useCart } from "../context/CartContext.jsx";
import { createOrder, initiatePayment } from "../services/orderApi.js";
import { useToast } from "../components/common/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

/* =========================================================
   PROVINCES & DISTRICTS (Nepal)
   ========================================================= */

const NEPAL_PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

const DISTRICTS_BY_PROVINCE = {
  Koshi: [
    "Bhojpur",
    "Dhankuta",
    "Ilam",
    "Jhapa",
    "Khotang",
    "Morang",
    "Okhaldhunga",
    "Panchthar",
    "Sankhuwasabha",
    "Solukhumbu",
    "Sunsari",
    "Taplejung",
    "Terhathum",
    "Udayapur",
  ],
  Madhesh: [
    "Bara",
    "Dhanusha",
    "Mahottari",
    "Parsa",
    "Rautahat",
    "Saptari",
    "Sarlahi",
    "Siraha",
  ],
  Bagmati: [
    "Bhaktapur",
    "Chitwan",
    "Dhading",
    "Dolakha",
    "Kathmandu",
    "Kavrepalanchok",
    "Lalitpur",
    "Makwanpur",
    "Nuwakot",
    "Ramechhap",
    "Rasuwa",
    "Sindhuli",
    "Sindhupalchok",
  ],
  Gandaki: [
    "Baglung",
    "Gorkha",
    "Kaski",
    "Lamjung",
    "Manang",
    "Mustang",
    "Myagdi",
    "Nawalpur",
    "Parbat",
    "Syangja",
    "Tanahun",
  ],
  Lumbini: [
    "Arghakhanchi",
    "Banke",
    "Bardiya",
    "Dang",
    "Eastern Rukum",
    "Gulmi",
    "Kapilvastu",
    "Parasi",
    "Palpa",
    "Pyuthan",
    "Rolpa",
    "Rupandehi",
  ],
  Karnali: [
    "Dailekh",
    "Dolpa",
    "Humla",
    "Jajarkot",
    "Jumla",
    "Kalikot",
    "Mugu",
    "Salyan",
    "Surkhet",
    "Western Rukum",
  ],
  Sudurpashchim: [
    "Achham",
    "Baitadi",
    "Bajhang",
    "Bajura",
    "Dadeldhura",
    "Darchula",
    "Doti",
    "Kailali",
    "Kanchanpur",
  ],
};

/* =========================================================
   PAYMENT METHODS
   ========================================================= */

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    desc: "Pay when you receive",
    icon: Banknote,
    color: "emerald",
    surcharge: 20,
  },
  {
    id: "khalti",
    label: "Khalti",
    desc: "Digital wallet",
    icon: Wallet,
    color: "purple",
    surcharge: 0,
  },
  {
    id: "esewa",
    label: "eSewa",
    desc: "Digital wallet",
    icon: Smartphone,
    color: "green",
    surcharge: 0,
  },
  {
    id: "imepay",
    label: "IME Pay",
    desc: "Digital wallet",
    icon: Smartphone,
    color: "red",
    surcharge: 0,
  },
];

/* =========================================================
   AUTO-SUBMIT FORM (eSewa / IME Pay)
   ========================================================= */

const autoSubmitForm = (action, fields) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.style.display = "none";

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function Checkout() {
  const { cart, subtotal, deliveryFee, tax, total, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    city: "",
    streetAddress: "",
    landmark: "",
  });
  const [payment, setPayment] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Prefill from user
  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Redirect if cart empty
  useEffect(() => {
    if (!cart || cart.items.length === 0) navigate("/cart");
  }, [cart, navigate]);

  const codSurcharge = payment === "cod" ? 20 : 0;
  const displayTotal = total + codSurcharge;

  // Validation
  const validate = () => {
    const errs = {};
    if (!address.fullName.trim()) errs.fullName = "Full name is required";
    if (!address.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^[0-9+\-\s()]{7,15}$/.test(address.phone))
      errs.phone = "Enter a valid phone number";
    if (!address.province) errs.province = "Select province";
    if (!address.district) errs.district = "Select district";
    if (!address.city.trim()) errs.city = "City is required";
    if (!address.streetAddress.trim())
      errs.streetAddress = "Street address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) {
      addToast("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const orderRes = await createOrder({
        items: cart.items,
        deliveryAddress: address,
        paymentMethod: payment,
      });
      const order = orderRes.data.order;

      // COD -> straight to orders
      if (payment === "cod") {
        await clearCart();
        addToast("Order placed successfully!", "success");
        navigate("/orders");
        return;
      }

      const payRes = await initiatePayment(order._id, payment);
      const { paymentUrl, formFields } = payRes.data || {};

      // eSewa / IME Pay -> auto-submit signed form
      if (paymentUrl && formFields && Object.keys(formFields).length > 0) {
        await clearCart();
        autoSubmitForm(paymentUrl, formFields);
        return;
      }

      // Khalti -> simple redirect
      if (paymentUrl) {
        await clearCart();
        window.location.href = paymentUrl;
        return;
      }

      // No payment URL -> order already placed
      await clearCart();
      addToast("Order placed successfully!", "success");
      navigate("/orders");
    } catch (err) {
      addToast(
        err.response?.data?.message || "Checkout failed. Please try again.",
        "error"
      );
      setLoading(false);
    }
  };

  const updateField = (key, value) => {
    setAddress((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const districts = address.province
    ? DISTRICTS_BY_PROVINCE[address.province] || []
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-40 sm:pb-10">
      <div className="container py-5 sm:py-7">
        {/* Back */}
        <button
          onClick={() => navigate("/cart")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-orange-500 sm:mb-6"
        >
          <ChevronLeft size={16} /> Back to Cart
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            Complete your order in a few quick steps
          </p>
        </div>

        <form
          onSubmit={submit}
          className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3 lg:gap-8"
        >
          {/* LEFT: FORM */}
          <div className="space-y-5 sm:space-y-6 lg:col-span-2">
            {/* ADDRESS CARD */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm sm:h-10 sm:w-10">
                  <MapPin size={17} className="text-orange-500 sm:hidden" />
                  <MapPin
                    size={19}
                    className="hidden text-orange-500 sm:block"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 sm:text-base">
                    Delivery Address
                  </h3>
                  <p className="text-[11px] text-slate-500 sm:text-xs">
                    Where should we deliver?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
                {/* Full Name */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
                    <User size={12} className="text-orange-500" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={address.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                      errors.fullName
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                      <AlertCircle size={11} /> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
                    <Phone size={12} className="text-orange-500" />
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+977 98XXXXXXXX"
                    value={address.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                      errors.phone
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                      <AlertCircle size={11} /> {errors.phone}
                    </p>
                  )}
                </div>

                {/* Province */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
                    <Building2 size={12} className="text-orange-500" />
                    Province <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={address.province}
                    onChange={(e) => {
                      updateField("province", e.target.value);
                      updateField("district", "");
                    }}
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-2 ${
                      errors.province
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  >
                    <option value="">Select province</option>
                    {NEPAL_PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {errors.province && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                      <AlertCircle size={11} /> {errors.province}
                    </p>
                  )}
                </div>

                {/* District */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
                    <Building2 size={12} className="text-orange-500" />
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={address.district}
                    onChange={(e) => updateField("district", e.target.value)}
                    disabled={!address.province}
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
                      errors.district
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  >
                    <option value="">
                      {address.province
                        ? "Select district"
                        : "Select province first"}
                    </option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                      <AlertCircle size={11} /> {errors.district}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
                    <Home size={12} className="text-orange-500" />
                    City / Municipality <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kathmandu"
                    value={address.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                      errors.city
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                      <AlertCircle size={11} /> {errors.city}
                    </p>
                  )}
                </div>

                {/* Street */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
                    <MapPin size={12} className="text-orange-500" />
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ward 5, Thamel"
                    value={address.streetAddress}
                    onChange={(e) =>
                      updateField("streetAddress", e.target.value)
                    }
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                      errors.streetAddress
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                  {errors.streetAddress && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                      <AlertCircle size={11} /> {errors.streetAddress}
                    </p>
                  )}
                </div>

                {/* Landmark */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
                    Landmark{" "}
                    <span className="text-[10px] font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Near temple, school, etc."
                    value={address.landmark}
                    onChange={(e) => updateField("landmark", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT CARD */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm sm:h-10 sm:w-10">
                  <CreditCard size={17} className="text-orange-500 sm:hidden" />
                  <CreditCard
                    size={19}
                    className="hidden text-orange-500 sm:block"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 sm:text-base">
                    Payment Method
                  </h3>
                  <p className="text-[11px] text-slate-500 sm:text-xs">
                    Choose how you&apos;d like to pay
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-2 sm:gap-3 sm:p-5">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = payment === method.id;
                  return (
                    <label
                      key={method.id}
                      className={`relative flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all sm:p-4 ${
                        isSelected
                          ? "border-orange-400 bg-orange-50/60 shadow-sm ring-2 ring-orange-100"
                          : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={isSelected}
                        onChange={(e) => setPayment(e.target.value)}
                        className="sr-only"
                      />

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${
                          isSelected
                            ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 sm:text-base">
                          {method.label}
                        </p>
                        <p className="text-[11px] text-slate-500 sm:text-xs">
                          {method.desc}
                          {method.surcharge > 0 &&
                            ` · +Rs. ${method.surcharge}`}
                        </p>
                      </div>

                      {isSelected && (
                        <CheckCircle2
                          size={20}
                          className="shrink-0 text-orange-500"
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                {
                  icon: ShieldCheck,
                  label: "Secure Payment",
                  sub: "100% safe",
                },
                { icon: Truck, label: "Fast Delivery", sub: "30-45 min" },
                {
                  icon: CheckCircle2,
                  label: "Easy Returns",
                  sub: "Hassle-free",
                },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm"
                >
                  <Icon size={16} className="text-orange-500" />
                  <p className="text-[11px] font-bold text-slate-800 sm:text-xs">
                    {label}
                  </p>
                  <p className="text-[10px] text-slate-500">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:col-span-1">
            <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg shadow-orange-100/40">
                {/* Header */}
                <div className="border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm">
                      <CreditCard size={15} className="text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 sm:text-base">
                        Order Summary
                      </h3>
                      <p className="text-[11px] text-slate-500 sm:text-xs">
                        {cart.items.length}{" "}
                        {cart.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items preview */}
                <div className="max-h-56 space-y-2 overflow-y-auto border-b border-slate-100 p-4">
                  {cart.items.slice(0, 4).map((item) => (
                    <div
                      key={item.mealId}
                      className="flex items-center gap-2.5"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-800">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {item.quantity} × Rs. {item.price}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs font-bold text-slate-800">
                        Rs. {item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                  {cart.items.length > 4 && (
                    <p className="pt-1 text-center text-[11px] text-slate-500">
                      +{cart.items.length - 4} more items
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 p-4 sm:p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold text-slate-800">
                      Rs. {subtotal}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Truck size={13} className="text-slate-400" />
                      Delivery Fee
                    </span>
                    <span className="font-semibold text-slate-800">
                      Rs. {deliveryFee}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Tax (10%)</span>
                    <span className="font-semibold text-slate-800">
                      Rs. {tax}
                    </span>
                  </div>

                  {payment === "cod" && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Banknote size={13} className="text-slate-400" />
                        COD Charge
                      </span>
                      <span className="font-semibold text-slate-800">
                        Rs. {codSurcharge}
                      </span>
                    </div>
                  )}

                  <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900">
                      Total
                    </span>
                    <span className="text-xl font-black text-slate-900 sm:text-2xl">
                      Rs. {displayTotal}
                    </span>
                  </div>

                  {/* Desktop submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 hidden w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:from-orange-600 hover:to-red-600 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:flex"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Pay Rs. {displayTotal}
                      </>
                    )}
                  </button>

                  {/* Secure note */}
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    Your payment is secure & encrypted
                  </div>
                </div>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
                <AlertCircle
                  size={15}
                  className="mt-0.5 shrink-0 text-amber-500"
                />
                <p className="text-[11px] leading-relaxed text-amber-800 sm:text-xs">
                  For COD orders, please keep exact change ready. Free delivery
                  on orders above <span className="font-bold">Rs. 1000</span>.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* STICKY BOTTOM BAR (Mobile only) */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] leading-none text-slate-500">Total</p>
            <p className="mt-0.5 text-lg font-black leading-none text-slate-900">
              Rs. {displayTotal}
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={submit}
            className="ml-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Lock size={14} />
                Place Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}