import { Link, useNavigate } from "react-router-dom";
import { Star, Heart, ShoppingCart, Zap } from "lucide-react";
import { useCart } from "../../context/CartContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useState } from "react";
import { addFavorite, removeFavorite } from "../../services/favoriteApi.js";

export default function MealCard({ meal }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const price = meal.price || 450;
  const discount = meal.discount || 0;
  const finalPrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart({
      mealId: meal.externalMealId,
      name: meal.name,
      image: meal.image,
      price: finalPrice,
      quantity: 1,
    });
  };

  const toggleFavorite = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (isFavorite) {
        await removeFavorite(meal.externalMealId || meal.mealId);
      } else {
        await addFavorite(meal.externalMealId || meal.mealId, { name: meal.name, image: meal.image, category: meal.category, area: meal.area });
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  return (
    <Link to={`/meals/${meal.externalMealId}`} className="meal-card group block bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 hover:shadow-lg">
      <div className="meal-card-image-wrapper">
        <img src={meal.image} alt={meal.name} className="meal-card-image" />
        {discount > 0 && (
          <span className="discount-badge">{discount}% OFF</span>
        )}
        <div className="meal-card-image-overlay" />
        <button
          onClick={toggleFavorite}
          className={`favorite-btn ${isFavorite ? "active" : "inactive"}`}
          aria-label="Favorite"
        >
          <Heart size={isFavorite ? 18 : 16} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-slate-800 mb-1 truncate text-sm sm:text-base group-hover:text-orange-600 transition-colors">{meal.name}</h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-2 truncate">{meal.area} • {meal.category}</p>
        <div className="flex items-center gap-1 mb-2 sm:mb-3">
          <Star size={12} className="text-amber-500 fill-amber-500 sm:hidden" />
          <Star size={14} className="text-amber-500 fill-amber-500 hidden sm:block" />
          <span className="text-xs sm:text-sm font-medium text-slate-700">{meal.rating || 4.5}</span>
          <span className="text-slate-300 mx-1">•</span>
          <span className="text-[10px] sm:text-xs text-slate-400">30-45 min</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="price-final text-base sm:text-lg">{finalPrice > 0 ? `Rs. ${finalPrice}` : "Free"}</span>
            {discount > 0 && <span className="price-original ml-1">Rs. {price}</span>}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate(`/buy-now/${meal.externalMealId}`);
              }}
              className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-2.5 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm shadow-sm hover:shadow-md"
            >
              <Zap size={14} className="sm:hidden" />
              <Zap size={16} className="hidden sm:block" />
              <span className="hidden sm:inline font-medium">Buy Now</span>
            </button>
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-2.5 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm shadow-sm hover:shadow-md"
            >
              <ShoppingCart size={14} className="sm:hidden" />
              <ShoppingCart size={16} className="hidden sm:block" />
              <span className="hidden sm:inline font-medium">Add</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

