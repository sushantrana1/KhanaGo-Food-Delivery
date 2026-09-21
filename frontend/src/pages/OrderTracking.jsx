import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { trackOrder } from "../services/orderApi.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

export default function OrderTracking() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    trackOrder(id)
      .then((res) => { if (!cancelled) { setData(res.data); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return <div className="section"><div className="container text-center py-20 text-slate-500">Order not found</div></div>;

  return (
    <div className="section">
      <div className="container max-w-3xl">
        <Link to={`/orders/${id}`} className="inline-flex items-center gap-1 text-slate-600 hover:text-orange-500 mb-6 text-sm sm:text-base transition-colors"><ArrowLeft size={18} /> Back to order</Link>
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Tracking Order #{data.order._id.slice(-6).toUpperCase()}</h1>
          {data.cancelled ? (
            <p className="text-slate-500">Status: <span className="font-medium text-red-500 capitalize">{data.order.orderStatus.replace(/_/g, " ")}</span></p>
          ) : (
            <p className="text-slate-500">Current Status: <span className="font-medium text-orange-500 capitalize">{data.order.orderStatus.replace(/_/g, " ")}</span></p>
          )}
        </div>
        {!data.cancelled && (
          <div className="card p-4 sm:p-6">
            <div className="space-y-2">
              {data.timeline.map((step) => (
                <div key={step.status} className="tracking-step">
                  <div className={`tracking-step-icon ${step.completed ? "completed" : step.current ? "current" : "pending"}`}>
                    {step.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </div>
                  <div className="tracking-step-content">
                    <h4>{step.label}</h4>
                    {step.current && <p>Current status</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
