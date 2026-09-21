import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategoryList } from "../services/mealApi.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategoryList()
      .then((res) => { setCategories(res.data.categories || []); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="section  relative -top-10">
      <div className="container">
        <h1 className="section-title">Categories</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link key={cat.strCategory} to={`/categories/${cat.strCategory}`} className="card card-hover card-interactive group">
              <div className="aspect-square overflow-hidden bg-slate-50">
                <img src={`https://www.themealdb.com/images/category/${cat.strCategory}.png`} alt={cat.strCategory} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-2 sm:p-3 text-center"><h3 className="font-medium text-slate-800 text-xs sm:text-sm">{cat.strCategory}</h3></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
