import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { getOrderById } from "../services/orderApi.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getOrderById(orderId);
        if (!cancelled) {
          setOrder(res.data.order);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!order) return <ErrorMessage message="Order not found" />;

  return (
    <div className="section">
      <div className="container max-w-2xl">
        <div className="card p-6 sm:p-8 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <CheckCircle2 className="text-green-500" size={36} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Order Confirmed!</h1>
          <p className="text-slate-500 mb-6 text-sm sm:text-base">Thank you for your purchase. Your order has been placed successfully.</p>

          <div className="card bg-slate-50 p-4 sm:p-6 mb-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Order ID</p>
                <p className="font-bold text-slate-800 text-sm sm:text-base">#{order._id.slice(-6).toUpperCase()}</p>
              </div>
              <span className="order-status delivered">Confirmed</span>
            </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Amount</span>
                  <span className="font-bold text-slate-800">Rs. {order.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method</span>
                  <span className="font-medium capitalize text-slate-800">{order.paymentMethod}</span>
                </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Delivery</span>
                <span className="font-medium text-slate-800">30-45 minutes</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to={`/orders/${order._id}`} className="btn-primary flex-1">
              View Order Details
            </Link>
            <Link to="/" className="btn-secondary flex-1">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
