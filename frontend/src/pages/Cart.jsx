import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { cart, updateCartItem, removeFromCart, clearCart, subtotal, deliveryFee, tax, total, itemCount } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="section">
        <div className="container text-center">
          <ShoppingCart className="mx-auto text-slate-300 mb-4" size={48} />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-6 text-sm sm:text-base">Looks like you haven't added any meals yet.</p>
          <Link to="/search" className="btn-primary">Browse Meals</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title mb-0">Your Cart ({itemCount})</h1>
          <button onClick={clearCart} className="text-red-500 hover:text-red-600 text-xs sm:text-sm flex items-center gap-1 transition-colors"><Trash2 size={14} className="sm:hidden" /><Trash2 size={16} className="hidden sm:block" /> Clear Cart</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {cart.items.map((item) => (
              <div key={item.mealId} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Rs. {item.price}</p>
                  <div className="flex items-center gap-2 sm:gap-3 mt-2">
                    <div className="quantity-control">
                      <button onClick={() => updateCartItem(item.mealId, item.quantity - 1)}><Minus size={14} /></button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button onClick={() => updateCartItem(item.mealId, item.quantity + 1)}><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.mealId)} className="text-red-500 hover:text-red-600 p-1 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-slate-800 text-sm sm:text-base">Rs. {item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="summary-card">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">Order Summary</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="summary-row"><span>Subtotal</span><span className="font-medium">Rs. {subtotal}</span></div>
              <div className="summary-row"><span>Delivery Fee</span><span className="font-medium">Rs. {deliveryFee}</span></div>
              <div className="summary-row"><span>Tax (10%)</span><span className="font-medium">Rs. {tax}</span></div>
              <div className="summary-row total"><span>Total</span><span>Rs. {total}</span></div>
            </div>
            <Link to="/checkout" className="btn-primary w-full mt-4 block text-center py-2.5 sm:py-3">Proceed to Checkout</Link>
            <Link to="/search" className="block text-center text-orange-500 hover:text-orange-600 text-xs sm:text-sm mt-2 transition-colors">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
