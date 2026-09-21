import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Heart, ShoppingCart, Clock, Utensils, Minus, Plus } from "lucide-react";
import { getMealById } from "../services/mealApi.js";
import { addFavorite, removeFavorite } from "../services/favoriteApi.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

export default function MealDetails() {
  const { id } = useParams();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { user: _user } = useAuth();
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMealById(id).then((res) => { if (!cancelled) { setMeal(res.data.results); setLoading(false); } }).catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!meal) return <ErrorMessage message="Meal not found" />;

  const price = meal.price || 450;
  const discount = meal.discount || 0;
  const finalPrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : price;
  const ingredients = meal.ingredients || [];

  const handleAddToCart = () => {
    addToCart({ mealId: meal.externalMealId, name: meal.name, image: meal.image, price: finalPrice, quantity: qty });
  };

  const toggleFav = async () => {
    if (!user) return;
    try {
      if (isFav) {
        await removeFavorite(meal.externalMealId || meal.mealId);
      } else {
        await addFavorite(meal.externalMealId || meal.mealId, { name: meal.name, image: meal.image, category: meal.category, area: meal.area });
      }
      setIsFav(!isFav);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <Link to="/search" className="inline-flex items-center gap-1 text-slate-600 hover:text-orange-500 mb-4 sm:mb-6 text-sm sm:text-base transition-colors"><ArrowLeft size={18} /> Back to meals</Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-100">
              <img src={meal.image} alt={meal.name} className="w-full h-64 sm:h-80 md:h-96 object-cover" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 tracking-tight">{meal.name}</h1>
            <p className="text-slate-500 mb-3 sm:mb-4 text-sm sm:text-base">{meal.area} • {meal.category}</p>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Star className="text-amber-500 fill-amber-500" size={18} />
              <span className="font-medium text-sm sm:text-base text-slate-700">{meal.rating || 4.5}</span>
              <span className="text-slate-300 mx-1">•</span>
              <span className="text-xs sm:text-sm text-slate-500">30-45 min</span>
            </div>
            <div className="flex items-baseline gap-2 mb-4 sm:mb-6">
              <span className="price-final">Rs. {finalPrice}</span>
              {discount > 0 && <span className="price-original">Rs. {price}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="quantity-control">
                <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></button>
                <span className="quantity-value">{qty}</span>
                <button onClick={() => setQty(qty + 1)}><Plus size={16} /></button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary flex items-center gap-2 text-sm sm:text-base"><ShoppingCart size={16} /> <span className="hidden sm:inline">Add to Cart</span></button>
              <button onClick={toggleFav} className={`p-2 rounded-lg border transition-colors ${isFav ? "border-red-500 text-red-500 bg-red-50" : "border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500"}`}><Heart size={18} fill={isFav ? "currentColor" : "none"} /></button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="card p-3 sm:p-4">
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm sm:text-base"><Utensils size={16} className="text-orange-500" /> Ingredients</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ingredients.map((ing, idx) => (
                    <li key={idx} className="flex justify-between text-xs sm:text-sm py-1 border-b border-slate-50 last:border-0"><span className="text-slate-600">{ing.ingredient}</span><span className="text-slate-400">{ing.measure}</span></li>
                  ))}
                </ul>
              </div>
              {meal.instructions && (
                <div className="card p-3 sm:p-4">
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm sm:text-base"><Clock size={16} className="text-orange-500" /> Instructions</h3>
                  <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed">{meal.instructions}</p>
                </div>
              )}
              {meal.youtubeUrl && (
                <a href={meal.youtubeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium text-sm sm:text-base transition-colors">Watch Tutorial →</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
