import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getOrderById } from "../services/orderApi.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getOrderById(id)
      .then((res) => { if (!cancelled) { setOrder(res.data.order); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!order) return <ErrorMessage message="Order not found" />;

  return (
    <div className="section">
      <div className="container">
        <Link to="/orders" className="inline-flex items-center gap-1 text-slate-600 hover:text-orange-500 mb-4 sm:mb-6 text-sm sm:text-base transition-colors"><ArrowLeft size={18} /> Back to orders</Link>
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800">Order #{order._id.slice(-6).toUpperCase()}</h1>
            <span className={`order-status ${order.orderStatus}`}>{order.orderStatus.replace(/_/g, " ")}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div><p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Payment Status</p><p className="font-medium text-slate-800">{order.paymentStatus}</p></div>
            <div><p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Payment Method</p><p className="font-medium text-slate-800 capitalize">{order.paymentMethod}</p></div>
            <div><p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total</p><p className="font-bold text-base sm:text-lg text-slate-800">Rs. {order.total}</p></div>
          </div>
        </div>
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-xl font-semibold text-slate-800 mb-3 sm:mb-4">Items</h2>
          <div className="space-y-3 sm:space-y-4">
            {order.items.map((item) => (
              <div key={item.mealId} className="flex items-center gap-3 sm:gap-4">
                <img src={item.image} alt={item.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0 border border-slate-100" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm sm:text-base truncate">{item.name}</p>
                  <p className="text-xs sm:text-sm text-slate-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium text-slate-800 text-sm sm:text-base flex-shrink-0">Rs. {item.price * item.quantity}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4 sm:p-6">
          <h2 className="text-base sm:text-xl font-semibold text-slate-800 mb-3 sm:mb-4">Delivery Address</h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{order.deliveryAddress.streetAddress}, {order.deliveryAddress.city}, {order.deliveryAddress.district}, {order.deliveryAddress.province}</p>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">{order.deliveryAddress.fullName} • {order.deliveryAddress.phone}</p>
        </div>
      </div>
    </div>
  );
}
