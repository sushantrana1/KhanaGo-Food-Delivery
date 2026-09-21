import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MealCard from "../components/meals/MealCard.jsx";
import { getMealsByCategory } from "../services/mealApi.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

export default function CategoryMeals() {
  const { category } = useParams();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMealsByCategory(category)
      .then((res) => { if (!cancelled) { setMeals(res.data.results || []); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => {
      cancelled = true;
    };
  }, [category]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title">{category}</h1>
        <p className="section-subtitle">{meals.length} meals found</p>
        {meals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <h3 className="empty-state-title">No meals in this category</h3>
            <p className="empty-state-description">Check back later or explore other categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">{meals.map((meal) => <MealCard key={meal.externalMealId} meal={meal} />)}</div>
        )}
      </div>
    </div>
  );
}
