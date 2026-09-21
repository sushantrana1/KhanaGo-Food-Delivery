import { useEffect, useState } from "react";
import { Users, ShoppingBag, DollarSign, Clock, Plus, Trash2, Edit3, X, Tag } from "lucide-react";
import { getDashboardStats, getUsers, getAdminOrders, getAdminDeals, createAdminDeal, updateAdminDeal, deleteAdminDeal } from "../../services/adminApi.js";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0, pendingOrders: 0, completedOrders: 0 });
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDealForm, setShowDealForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [dealForm, setDealForm] = useState({ title: "", description: "", meal: "", discountPercentage: "", originalPrice: "", dealPrice: "", startDate: "", endDate: "", maxClaims: 100, badge: "Hot Deal", image: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getDashboardStats(), getUsers(), getAdminOrders(), getAdminDeals()])
      .then(([statsRes, usersRes, ordersRes, dealsRes]) => {
        if (!cancelled) {
          setStats(statsRes.data.stats);
          setUsers(usersRes.data.results || []);
          setOrders(ordersRes.data.results || []);
          setDeals(dealsRes.data.results || []);
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) });
    return () => {
      cancelled = true;
    };
  }, []);

  const resetForm = () => {
    setDealForm({ title: "", description: "", meal: "", discountPercentage: "", originalPrice: "", dealPrice: "", startDate: "", endDate: "", maxClaims: 100, badge: "Hot Deal", image: "" });
    setEditingDeal(null);
    setShowDealForm(false);
  };

  const handleSubmitDeal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...dealForm,
        discountPercentage: Number(dealForm.discountPercentage),
        originalPrice: Number(dealForm.originalPrice),
        dealPrice: Number(dealForm.dealPrice),
        maxClaims: Number(dealForm.maxClaims),
        startDate: new Date(dealForm.startDate).toISOString(),
        endDate: new Date(dealForm.endDate).toISOString(),
      };
      if (editingDeal) {
        const res = await updateAdminDeal(editingDeal._id, payload);
        setDeals((prev) => prev.map((d) => (d._id === editingDeal._id ? res.data.data : d)));
      } else {
        const res = await createAdminDeal(payload);
        setDeals((prev) => [res.data.data, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setDealForm({
      title: deal.title || "",
      description: deal.description || "",
      meal: deal.meal?._id || "",
      discountPercentage: deal.discountPercentage || "",
      originalPrice: deal.originalPrice || "",
      dealPrice: deal.dealPrice || "",
      startDate: deal.startDate ? new Date(deal.startDate).slice(0, 16) : "",
      endDate: deal.endDate ? new Date(deal.endDate).slice(0, 16) : "",
      maxClaims: deal.maxClaims || 100,
      badge: deal.badge || "Hot Deal",
      image: deal.image || "",
    });
    setShowDealForm(true);
  };

  const handleDeleteDeal = async (id) => {
    if (!confirm("Delete this deal?")) return;
    await deleteAdminDeal(id);
    setDeals((prev) => prev.filter((d) => d._id !== id));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title">Admin Dashboard</h1>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {[{label: "Total Users", value: stats.users, icon: Users}, {label: "Total Orders", value: stats.orders, icon: ShoppingBag}, {label: "Revenue", value: `Rs. ${stats.revenue}`, icon: DollarSign}, {label: "Pending Orders", value: stats.pendingOrders, icon: Clock}].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-orange-100 text-orange-500 rounded-full flex-shrink-0"><s.icon size={18} className="sm:hidden" /><s.icon size={24} className="hidden sm:block" /></div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-slate-500 truncate uppercase tracking-wider">{s.label}</p>
                  <p className="text-lg sm:text-2xl font-bold text-slate-800 truncate">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <div className="card p-4 sm:p-6">
            <h2 className="text-base sm:text-xl font-semibold text-slate-800 mb-3 sm:mb-4">Recent Users</h2>
            <div className="space-y-2 sm:space-y-3">{users.slice(0, 5).map((u) => (<div key={u._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"><div className="min-w-0"><p className="font-medium text-slate-800 text-sm sm:text-base truncate">{u.name}</p><p className="text-xs sm:text-sm text-slate-500 truncate">{u.email}</p></div><span className="badge badge-neutral text-[10px] sm:text-xs flex-shrink-0">{u.role}</span></div>))}</div>
          </div>
          <div className="card p-4 sm:p-6">
            <h2 className="text-base sm:text-xl font-semibold text-slate-800 mb-3 sm:mb-4">Recent Orders</h2>
            <div className="space-y-2 sm:space-y-3">{orders.slice(0, 5).map((o) => (<div key={o._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"><div className="min-w-0"><p className="font-medium text-slate-800 text-sm sm:text-base">Order #{o._id.slice(-6).toUpperCase()}</p><p className="text-xs sm:text-sm text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</p></div><span className={`order-status ${o.orderStatus} text-[10px] sm:text-xs`}>{o.orderStatus.replace(/_/g, " ")}</span></div>))}</div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-xl font-semibold text-slate-800 flex items-center gap-2"><Tag size={20} className="text-orange-500" /> Deals Management</h2>
            <button onClick={() => { resetForm(); setShowDealForm(true); }} className="btn-primary btn-sm flex items-center gap-1"><Plus size={16} /> New Deal</button>
          </div>
          {showDealForm && (
            <div className="card p-4 sm:p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">{editingDeal ? "Edit Deal" : "Create Deal"}</h3>
                <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmitDeal} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="input-group"><label className="input-label">Title</label><input className="input" value={dealForm.title} onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })} required /></div>
                <div className="input-group"><label className="input-label">Meal ID</label><input className="input" value={dealForm.meal} onChange={(e) => setDealForm({ ...dealForm, meal: e.target.value })} required /></div>
                <div className="input-group"><label className="input-label">Discount %</label><input type="number" className="input" value={dealForm.discountPercentage} onChange={(e) => setDealForm({ ...dealForm, discountPercentage: e.target.value })} required min="1" max="100" /></div>
                <div className="input-group"><label className="input-label">Original Price</label><input type="number" className="input" value={dealForm.originalPrice} onChange={(e) => setDealForm({ ...dealForm, originalPrice: e.target.value })} required /></div>
                <div className="input-group"><label className="input-label">Deal Price</label><input type="number" className="input" value={dealForm.dealPrice} onChange={(e) => setDealForm({ ...dealForm, dealPrice: e.target.value })} required /></div>
                <div className="input-group"><label className="input-label">Start Date</label><input type="datetime-local" className="input" value={dealForm.startDate} onChange={(e) => setDealForm({ ...dealForm, startDate: e.target.value })} required /></div>
                <div className="input-group"><label className="input-label">End Date</label><input type="datetime-local" className="input" value={dealForm.endDate} onChange={(e) => setDealForm({ ...dealForm, endDate: e.target.value })} required /></div>
                <div className="input-group"><label className="input-label">Max Claims</label><input type="number" className="input" value={dealForm.maxClaims} onChange={(e) => setDealForm({ ...dealForm, maxClaims: e.target.value })} /></div>
                <div className="input-group"><label className="input-label">Badge</label><input className="input" value={dealForm.badge} onChange={(e) => setDealForm({ ...dealForm, badge: e.target.value })} /></div>
                <div className="input-group sm:col-span-2"><label className="input-label">Image URL</label><input className="input" value={dealForm.image} onChange={(e) => setDealForm({ ...dealForm, image: e.target.value })} /></div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : editingDeal ? "Update Deal" : "Create Deal"}</button>
                  <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Meal</th>
                    <th>Discount</th>
                    <th>Price</th>
                    <th>Claims</th>
                    <th>Ends</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.length === 0 ? (
                    <tr><td colSpan="7" className="text-center text-slate-400 py-6">No deals yet</td></tr>
                  ) : deals.map((deal) => (
                    <tr key={deal._id}>
                      <td className="font-medium">{deal.title}</td>
                      <td>{deal.meal?.name || deal.meal}</td>
                      <td>{deal.discountPercentage}%</td>
                      <td>Rs. {deal.dealPrice} <span className="text-slate-400 line-through text-xs">Rs. {deal.originalPrice}</span></td>
                      <td>{deal.claimedCount}/{deal.maxClaims}</td>
                      <td>{new Date(deal.endDate).toLocaleDateString()}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEditDeal(deal)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-orange-600 transition-colors"><Edit3 size={16} /></button>
                          <button onClick={() => handleDeleteDeal(deal._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
