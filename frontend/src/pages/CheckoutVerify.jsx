import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { verifyKhalti, verifyEsewa, verifyImepay } from "../services/paymentApi.js";
import { useNavigate } from "react-router-dom";

export default function CheckoutVerify() {
  const [searchParams] = useSearchParams();
  const provider = searchParams.get("provider");
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your payment...");
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        let res;
        if (provider === "khalti") res = await verifyKhalti(searchParams.get("pidx") || "");
        else if (provider === "esewa") res = await verifyEsewa(searchParams.get("transaction_uuid") || searchParams.get("transactionId") || "");
        else if (provider === "imepay") res = await verifyImepay(searchParams.get("transactionId") || "");
        else {
          setStatus("error");
          setMessage("Invalid payment provider");
          return;
        }
        if (res.data?.payment?.status === "completed") {
          setStatus("success");
          setMessage("Payment successful! Your order has been confirmed.");
        } else {
          setStatus("error");
          setMessage("Payment failed or was cancelled. Please try again.");
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Payment verification failed");
      }
    };
    verify();
  }, [provider, searchParams]);

  return (
    <div className="verify-card">
      <div className="verify-card-inner">
        {status === "verifying" && <Loader2 className="mx-auto text-orange-500 mb-4 animate-spin" size={48} />}
        {status === "success" && <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={48} />}
        {status === "error" && <XCircle className="mx-auto text-red-500 mb-4" size={48} />}
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{status === "success" ? "Payment Successful" : status === "error" ? "Payment Failed" : "Verifying Payment"}</h2>
        <p className="text-slate-500 mb-6 text-sm sm:text-base">{message}</p>
        <button onClick={() => navigate("/orders")} className="btn-primary">View Orders</button>
      </div>
    </div>
  );
}
