import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../services/orderApi.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [favCount] = useState(0);
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

  const totalSpent = orders.reduce((acc, o) => acc + (o.paymentStatus === "completed" ? o.total : 0), 0);
  const completed = orders.filter((o) => o.orderStatus === "delivered").length;

  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title">Dashboard</h1>
        <p className="section-subtitle">Welcome back!</p>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {[{label: "Total Orders", value: orders.length}, {label: "Completed Orders", value: completed}, {label: "Favorite Meals", value: favCount}, {label: "Total Spent", value: `Rs. ${totalSpent}`}].map((stat) => (
            <div key={stat.label} className="stat-card">
              <p className="text-xs sm:text-sm text-slate-500 mb-1 uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="card p-4 sm:p-6">
          <div className="page-header mb-3 sm:mb-4">
            <h2 className="text-base sm:text-xl font-semibold text-slate-800">Recent Orders</h2>
            <Link to="/orders" className="text-orange-500 hover:text-orange-600 text-xs sm:text-sm font-medium transition-colors">View All →</Link>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state py-8 sm:py-10">
              <h3 className="empty-state-title">No orders yet</h3>
              <p className="empty-state-description">Start exploring and place your first order!</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">{orders.slice(0, 5).map((order) => (
              <Link key={order._id} to={`/orders/${order._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                <div>
                  <p className="font-medium text-slate-800 text-sm sm:text-base">Order #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs sm:text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="font-bold text-slate-800 text-sm sm:text-base">Rs. {order.total}</p>
              </Link>
            ))}</div>
          )}
        </div>
      </div>
    </div>
  );
}
