import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import MealCard from "../components/meals/MealCard.jsx";
import { getFavorites, removeFavorite } from "../services/favoriteApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

export default function Favorites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    if (!user) { setLoading(false); return; }
    getFavorites()
      .then((res) => { if (!cancelled) { setItems(res.data.results || []); } })
      .catch((err) => { if (!cancelled) { setError(err.message); } })
      .finally(() => { if (!cancelled) { setLoading(false); } });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggle = async (meal) => {
    try {
      await removeFavorite(meal.externalMealId || meal.mealId);
      setItems((prev) => prev.filter((i) => (i.externalMealId || i.mealId) !== (meal.externalMealId || meal.mealId)));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  if (!user) return <div className="section"><div className="container text-center py-12 sm:py-20 text-slate-500 text-sm sm:text-base">Please login to view favorites.</div></div>;
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title">My Favorites</h1>
        {items.length === 0 ? (
          <div className="empty-state">
            <Heart className="empty-state-icon" size={36} />
            <h3 className="empty-state-title">No favorites yet</h3>
            <p className="empty-state-description">Save your favorite meals by clicking the heart icon on any meal card.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">{items.map((meal) => (
            <div key={meal._id} className="relative group">
              <MealCard meal={meal} />
              <button onClick={() => toggle(meal)} className="favorite-btn active"><Heart size={16} fill="currentColor" /></button>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
