import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../services/orderApi.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getOrders()
      .then((res) => { if (!cancelled) { setOrders(res.data.results || []); } })
      .catch((err) => { if (!cancelled) { setError(err.message); } })
      .finally(() => { if (!cancelled) { setLoading(false); } });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title">My Orders</h1>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            </div>
            <h3 className="empty-state-title">No orders yet</h3>
            <p className="empty-state-description">Start exploring our menu and place your first order!</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">{orders.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`} className="order-card">
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm sm:text-base">Order #{order._id.slice(-6).toUpperCase()}</p>
                <p className="text-xs sm:text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-slate-800 text-sm sm:text-base">Rs. {order.total}</p>
                <span className={`order-status ${order.orderStatus}`}>{order.orderStatus.replace(/_/g, " ")}</span>
              </div>
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {order.items.slice(0, 4).map((item) => <img key={item.mealId} src={item.image} alt={item.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0 border border-slate-100" />)}
              </div>
            </Link>
          ))}</div>
        )}
      </div>
    </div>
  );
}
