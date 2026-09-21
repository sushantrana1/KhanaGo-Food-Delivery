import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, MapPin } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { createOrder, initiatePayment } from "../services/orderApi.js";
import { useToast } from "../components/common/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Checkout() {
  const { cart, subtotal, deliveryFee, tax, total, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [address, setAddress] = useState({ fullName: "", phone: "", province: "", district: "", city: "", streetAddress: "", landmark: "" });
  const [payment, setPayment] = useState("cod");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setAddress(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  useEffect(() => {
    if (cart.items.length === 0) navigate("/cart");
  }, [cart, navigate]);

  const codSurcharge = payment === "cod" ? 20 : 0;
  const displayTotal = total + codSurcharge;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderRes = await createOrder({ items: cart.items, deliveryAddress: address, paymentMethod: payment });
      const order = orderRes.data.order;
      if (payment === "cod") {
        await clearCart();
        addToast("Order placed successfully!", "success");
        navigate("/orders");
      } else {
        const payRes = await initiatePayment(order._id, payment);
        if (payRes.data.paymentUrl) {
          window.location.href = payRes.data.paymentUrl;
        } else {
          await clearCart();
          addToast("Order placed successfully!", "success");
          navigate("/orders");
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Checkout failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title">Checkout</h1>
        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <div className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2"><MapPin size={18} className="sm:hidden text-orange-500" /><MapPin size={20} className="hidden sm:block text-orange-500" /> Delivery Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input required placeholder="John Doe" className="input" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input required placeholder="+977 98xxxxxxxx" className="input" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Province</label>
                  <input required placeholder="Province" className="input" value={address.province} onChange={(e) => setAddress({ ...address, province: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">District</label>
                  <input required placeholder="District" className="input" value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">City</label>
                  <input required placeholder="City" className="input" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Street Address</label>
                  <input required placeholder="Street Address" className="input" value={address.streetAddress} onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })} />
                </div>
                <div className="input-group sm:col-span-2">
                  <label className="input-label">Landmark (Optional)</label>
                  <input placeholder="Near temple, school, etc." className="input" value={address.landmark} onChange={(e) => setAddress({ ...address, landmark: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <div className="summary-card">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">Order Summary</h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="summary-row"><span>Subtotal</span><span className="font-medium">Rs. {subtotal}</span></div>
                <div className="summary-row"><span>Delivery Fee</span><span className="font-medium">Rs. {deliveryFee}</span></div>
                <div className="summary-row"><span>Tax (10%)</span><span className="font-medium">Rs. {tax}</span></div>
                {payment === "cod" && (
                  <div className="summary-row"><span>Cash on Delivery charge</span><span className="font-medium">Rs. {codSurcharge}</span></div>
                )}
                <div className="summary-row total"><span>Total</span><span>Rs. {displayTotal}</span></div>
              </div>
            </div>
            <div className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2"><CreditCard size={18} className="sm:hidden text-orange-500" /><CreditCard size={20} className="hidden sm:block text-orange-500" /> Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {["cod", "khalti", "esewa", "imepay"].map((p) => (
                  <label key={p} className={`radio-card ${payment === p ? "selected" : ""}`}>
                    <input type="radio" name="payment" value={p} checked={payment === p} onChange={(e) => setPayment(e.target.value)} />
                    <span className="capitalize font-medium text-slate-700 text-sm sm:text-base">{p === "cod" ? "Cash on Delivery" : p}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 sm:py-3">{loading ? "Processing..." : `Pay Rs. ${displayTotal}`}</button>
          </div>
        </form>
      </div>
    </div>
  );
}