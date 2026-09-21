import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Clock, Tag } from "lucide-react";
import { getMealById } from "../services/mealApi.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../components/common/Toast.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

export default function BuyNow() {
  const { mealId } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const { addToCart, clearCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getMealById(mealId);
        if (!cancelled) {
          setMeal(res.data.results);
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
  }, [mealId]);

  const handleBuyNow = async () => {
    try {
      await clearCart();
      await addToCart({
        mealId: meal.externalMealId,
        name: meal.name,
        image: meal.image,
        price: finalPrice,
        quantity: qty,
      });
      addToast("Item added! Proceeding to checkout.", "success");
      navigate("/checkout");
    } catch {
      addToast("Something went wrong. Please try again.", "error");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!meal) return <ErrorMessage message="Meal not found" />;

  const price = meal.price || 450;
  const discount = meal.discount || 0;
  const finalPrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : price;

  return (
    <div className="section">
      <div className="container">
        <Link to={`/meals/${mealId}`} className="inline-flex items-center gap-1 text-slate-600 hover:text-orange-500 mb-4 sm:mb-6 text-sm sm:text-base transition-colors">
          <ArrowLeft size={18} /> Back to meal
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-100">
              <img src={meal.image} alt={meal.name} className="w-full h-64 sm:h-80 md:h-96 object-cover" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{meal.name}</h1>
                {discount > 0 && (
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md flex-shrink-0">
                    <Tag size={12} /> {discount}% OFF
                  </span>
                )}
              </div>
              <p className="text-slate-500 mb-3 sm:mb-4 text-sm sm:text-base">{meal.area} • {meal.category}</p>

              <div className="flex items-baseline gap-2 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-slate-800">Rs. {finalPrice}</span>
                {discount > 0 && <span className="text-base sm:text-lg text-slate-400 line-through">Rs. {price}</span>}
              </div>

              <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
                <Clock size={16} className="text-orange-500" />
                <span>Estimated delivery: 30-45 minutes</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="input-label">Quantity</label>
                  <div className="quantity-control">
                    <button onClick={() => setQty(Math.max(1, qty - 1))}><ShoppingCart size={16} style={{ transform: "rotate(180deg)" }} /></button>
                    <span className="quantity-value">{qty}</span>
                    <button onClick={() => setQty(qty + 1)}><ShoppingCart size={16} /></button>
                  </div>
                </div>

                <div className="card p-3 sm:p-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium">Rs. {finalPrice * qty}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Delivery Fee</span>
                    <span className="font-medium">Rs. 100</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Tax (10%)</span>
                    <span className="font-medium">Rs. {Math.round(finalPrice * qty * 0.1)}</span>
                  </div>
                  <div className="divider" />
                  <div className="flex justify-between font-bold text-base sm:text-lg">
                    <span>Total</span>
                    <span>Rs. {finalPrice * qty + 100 + Math.round(finalPrice * qty * 0.1)}</span>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleBuyNow} className="btn-primary w-full mt-4 py-3 sm:py-4 text-base sm:text-lg">
              Buy Now — Rs. {finalPrice * qty + 100 + Math.round(finalPrice * qty * 0.1)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
