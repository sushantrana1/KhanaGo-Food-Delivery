import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Package,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Truck,
  ShoppingBag,
  AlertCircle,
  Receipt,
} from "lucide-react";

import {
  verifyKhalti,
  verifyEsewa,
  verifyImepay,
} from "../services/paymentApi.js";

/* =========================================================
   PROVIDER NAMES
   ========================================================= */

const PROVIDER_LABELS = {
  khalti: "Khalti",
  esewa: "eSewa",
  imepay: "IME Pay",
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function CheckoutVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const provider = searchParams.get("provider");
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("Verifying your payment...");
  const [retrying, setRetrying] = useState(false);

  const verify = async () => {
    setStatus("verifying");
    setMessage("Verifying your payment...");

    try {
      let res;
      if (provider === "khalti") {
        res = await verifyKhalti(searchParams.get("pidx") || "");
      } else if (provider === "esewa") {
        res = await verifyEsewa(
          searchParams.get("transaction_uuid") ||
            searchParams.get("transactionId") ||
            ""
        );
      } else if (provider === "imepay") {
        res = await verifyImepay(searchParams.get("transactionId") || "");
      } else {
        setStatus("error");
        setMessage("Invalid payment provider. Please contact support.");
        return;
      }

      if (res.data?.payment?.status === "completed") {
        setStatus("success");
        setMessage(
          "Your payment was successful and your order has been confirmed."
        );
      } else {
        setStatus("error");
        setMessage(
          "Your payment was not completed. The order has not been placed."
        );
      }
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.message ||
          "We could not verify your payment. Please try again."
      );
    }
  };

  useEffect(() => {
    verify();
    // eslint-disable-next-line
  }, [provider]);

  const handleRetry = async () => {
    setRetrying(true);
    await verify();
    setRetrying(false);
  };

  const providerLabel = PROVIDER_LABELS[provider] || "payment provider";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container py-8 sm:py-12">
        <div className="mx-auto max-w-lg">

          {/* ===== CARD ===== */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-orange-100/40">

            {/* Top strip */}
            <div
              className={`h-1.5 w-full ${
                status === "success"
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                  : status === "error"
                  ? "bg-gradient-to-r from-red-400 to-red-600"
                  : "bg-gradient-to-r from-orange-400 to-red-500"
              }`}
            />

            <div className="p-6 text-center sm:p-10">

              {/* ===== ICON ===== */}
              <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">

                {/* Verifying: spinning loader */}
                {status === "verifying" && (
                  <>
                    <span className="absolute inset-0 animate-ping rounded-full bg-orange-200 opacity-50" />
                    <span
                      className="absolute inset-2 animate-ping rounded-full bg-orange-300 opacity-30"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-xl shadow-orange-200 sm:h-24 sm:w-24">
                      <Loader2
                        size={40}
                        className="animate-spin text-white sm:hidden"
                        strokeWidth={2.5}
                      />
                      <Loader2
                        size={48}
                        className="hidden animate-spin text-white sm:block"
                        strokeWidth={2.5}
                      />
                    </div>
                  </>
                )}

                {/* Success: check with pulse rings */}
                {status === "success" && (
                  <>
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-200 opacity-60" />
                    <span
                      className="absolute inset-2 animate-ping rounded-full bg-emerald-300 opacity-40"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-200 sm:h-24 sm:w-24">
                      <CheckCircle2
                        size={40}
                        className="text-white sm:hidden"
                        strokeWidth={2.5}
                      />
                      <CheckCircle2
                        size={48}
                        className="hidden text-white sm:block"
                        strokeWidth={2.5}
                      />
                    </div>
                  </>
                )}

                {/* Error: X icon */}
                {status === "error" && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-red-100 opacity-60" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-xl shadow-red-200 sm:h-24 sm:w-24">
                      <XCircle
                        size={40}
                        className="text-white sm:hidden"
                        strokeWidth={2.5}
                      />
                      <XCircle
                        size={48}
                        className="hidden text-white sm:block"
                        strokeWidth={2.5}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* ===== BADGE ===== */}
              <div
                className={`mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${
                  status === "success"
                    ? "border-emerald-100 bg-emerald-50"
                    : status === "error"
                    ? "border-red-100 bg-red-50"
                    : "border-orange-100 bg-orange-50"
                }`}
              >
                {status === "verifying" && (
                  <>
                    <Loader2 size={11} className="animate-spin text-orange-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 sm:text-xs">
                      Please wait
                    </span>
                  </>
                )}
                {status === "success" && (
                  <>
                    <Sparkles size={11} className="text-emerald-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 sm:text-xs">
                      Payment successful
                    </span>
                  </>
                )}
                {status === "error" && (
                  <>
                    <AlertCircle size={11} className="text-red-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 sm:text-xs">
                      Payment failed
                    </span>
                  </>
                )}
              </div>

              {/* ===== TITLE + MESSAGE ===== */}
              <h1 className="mb-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {status === "success"
                  ? "Payment successful"
                  : status === "error"
                  ? "Payment failed"
                  : "Verifying payment"}
              </h1>

              <p className="mx-auto max-w-sm text-xs leading-relaxed text-slate-500 sm:text-sm">
                {message}
              </p>

              {/* ===== PROVIDER TAG ===== */}
              {provider && (
                <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:text-xs">
                  via {providerLabel}
                </p>
              )}

              {/* ===== ACTIONS ===== */}
              <div className="mt-7 space-y-2.5">

                {/* VERIFYING */}
                {status === "verifying" && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-left">
                    <div className="flex items-start gap-2.5">
                      <Loader2
                        size={14}
                        className="mt-0.5 shrink-0 animate-spin text-slate-400"
                      />
                      <p className="text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                        This may take a few seconds. Please do not close this
                        page.
                      </p>
                    </div>
                  </div>
                )}

                {/* SUCCESS */}
                {status === "success" && (
                  <>
                    <Link
                      to="/orders"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
                    >
                      <Package size={16} />
                      View My Orders
                      <ArrowRight size={15} />
                    </Link>

                    <Link
                      to="/search"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <ShoppingBag size={15} />
                      Continue Shopping
                    </Link>
                  </>
                )}

                {/* ERROR */}
                {status === "error" && (
                  <>
                    <button
                      onClick={handleRetry}
                      disabled={retrying}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {retrying ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={16} />
                          Try Again
                        </>
                      )}
                    </button>

                    <Link
                      to="/orders"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Receipt size={15} />
                      Check My Orders
                    </Link>

                    <Link
                      to="/cart"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <ShoppingBag size={15} />
                      Back to Cart
                    </Link>
                  </>
                )}
              </div>

              {/* ===== TRUST NOTE ===== */}
              <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
                <ShieldCheck
                  size={14}
                  className="mt-0.5 shrink-0 text-amber-500"
                />
                <p className="text-[11px] leading-relaxed text-amber-800 sm:text-xs">
                  If money was deducted but the order was not placed, it will
                  be refunded within 3 to 5 business days. Contact{" "}
                  <a href="tel:+9779815631275" className="font-bold underline">
                    support
                  </a>{" "}
                  for help.
                </p>
              </div>

              {/* ===== FOOTER ===== */}
              <p className="mt-6 text-center text-[10px] text-slate-400 sm:text-xs">
                KhanaGo - Your Food, Your Way
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}