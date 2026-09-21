import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, SlidersHorizontal, Flame, TrendingUp, Sparkles, X } from "lucide-react";
import MealCard from "../components/meals/MealCard.jsx";
import { searchMeals, getMealsByCategory, getMealsByArea, getMealsByIngredient, getCategoryList, getAreaList, getIngredientList, getRandomMeals } from "../services/mealApi.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [filters, setFilters] = useState({ category: "", area: "", ingredient: "" });
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchParams] = useSearchParams();
  const [suggestedMeals, setSuggestedMeals] = useState([]);
  const initialSearchDoneRef = useRef(false);

  const toggleFilter = (key) => {
    setActiveFilter(activeFilter === key ? null : key);
  };

  const clearFilters = () => {
    setFilters({ category: "", area: "", ingredient: "" });
    setActiveFilter(null);
  };

  const performSearch = useCallback(async (q) => {
    setLoading(true);
    setError("");
    try {
      let res;
      if (filters.category) res = await getMealsByCategory(filters.category);
      else if (filters.area) res = await getMealsByArea(filters.area);
      else if (filters.ingredient) res = await getMealsByIngredient(filters.ingredient);
      else if (q) res = await searchMeals(q);
      else res = { data: { results: [] } };
      setResults(res.data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cat, area, ing] = await Promise.all([getCategoryList(), getAreaList(), getIngredientList()]);
        if (!cancelled) {
          setCategories(cat.data.categories || []);
          setAreas(area.data.areas || []);
          setIngredients(ing.data.ingredients || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load filters");
        }
      }
      try {
        const randomRes = await getRandomMeals(8);
        if (!cancelled) {
          setSuggestedMeals(randomRes.data.results || []);
        }
      } catch {
        // optional: ignore random meals failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !initialSearchDoneRef.current) {
      initialSearchDoneRef.current = true;
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams, performSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  const hasActiveFilters = filters.category || filters.area || filters.ingredient;
  const popularCategories = categories.slice(0, 8);

  return (
    <div className="min-h-screen">
      <div className="gradient-hero">
        <div className="hero-content container py-12 sm:py-16 md:py-20">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4 sm:mb-6 border border-white/20">
              <Sparkles size={16} className="text-yellow-200" />
              <span className="text-xs sm:text-sm font-medium">Explore delicious meals</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">Find Your Next Meal</h1>
            <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-2xl mx-auto">Search from hundreds of recipes, cuisines, and ingredients</p>
          </div>
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="search-input-wrapper">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <SearchIcon className="search-input-icon" size={20} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for meals, cuisines, ingredients..."
                    className="search-input"
                  />
                </div>
                <button type="submit" className="btn-primary px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl">
                  <SearchIcon size={18} className="sm:hidden" />
                  <SearchIcon size={20} className="hidden sm:block" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </form>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 sm:mt-6">
            {popularCategories.slice(0, 6).map((cat) => (
              <button
                key={cat.strCategory}
                onClick={() => { setQuery(""); setFilters({ ...filters, category: cat.strCategory }); performSearch(""); }}
                className="filter-chip"
              >
                {cat.strCategory}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <button
              onClick={() => toggleFilter("category")}
              className={`filter-chip ${activeFilter === "category" || filters.category ? "active" : ""}`}
            >
              <SlidersHorizontal size={14} /> Category {filters.category && <X size={14} onClick={(e) => { e.stopPropagation(); setFilters({ ...filters, category: "" }); performSearch(query); }} />}
            </button>
            <button
              onClick={() => toggleFilter("area")}
              className={`filter-chip ${activeFilter === "area" || filters.area ? "active" : ""}`}
            >
              <Flame size={14} /> Area {filters.area && <X size={14} onClick={(e) => { e.stopPropagation(); setFilters({ ...filters, area: "" }); performSearch(query); }} />}
            </button>
            <button
              onClick={() => toggleFilter("ingredient")}
              className={`filter-chip ${activeFilter === "ingredient" || filters.ingredient ? "active" : ""}`}
            >
              <TrendingUp size={14} /> Ingredient {filters.ingredient && <X size={14} onClick={(e) => { e.stopPropagation(); setFilters({ ...filters, ingredient: "" }); performSearch(query); }} />}
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="filter-chip text-red-600 hover:border-red-300 hover:text-red-700">
                <X size={14} /> Clear All
              </button>
            )}
          </div>

          {activeFilter && (
            <div className="card p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in-up">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 capitalize">
                {activeFilter === "category" && "Select Category"}
                {activeFilter === "area" && "Select Area"}
                {activeFilter === "ingredient" && "Select Ingredient"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {(activeFilter === "category" ? categories : activeFilter === "area" ? areas : ingredients).map((item) => {
                  const value = activeFilter === "category" ? item.strCategory : activeFilter === "area" ? item.strArea : item.strIngredient;
                  return (
                    <button
                      key={value}
                      onClick={() => {
                        setFilters({ ...filters, [activeFilter]: value });
                        setActiveFilter(null);
                        performSearch(query);
                      }}
                      className={`filter-chip ${filters[activeFilter] === value ? "active" : ""}`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {loading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} retry={() => performSearch(query)} />}
          {!loading && results.length === 0 && !hasActiveFilters && !query && (
            <div className="mb-8 sm:mb-12">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Flame className="text-orange-500" size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Trending Now</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {suggestedMeals.map((meal) => <MealCard key={meal.externalMealId} meal={meal} />)}
              </div>
            </div>
          )}
          {!loading && results.length === 0 && !hasActiveFilters && !query && (
            <div className="text-center py-12 sm:py-20">
              <SearchIcon className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-lg sm:text-xl font-semibold text-slate-700 mb-2">Start Your Culinary Journey</h3>
              <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto">Search by meal name, cuisine, or ingredient. Use filters to narrow down your perfect dish.</p>
            </div>
          )}
          {!loading && results.length === 0 && (hasActiveFilters || query) && (
            <div className="text-center py-12 sm:py-20">
              <SearchIcon className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-lg sm:text-xl font-semibold text-slate-700 mb-2">No meals found</h3>
              <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto mb-4">Try adjusting your search or filters to discover more meals.</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          )}
          {!loading && results.length > 0 && (
            <>
              <div className="mb-4 sm:mb-6">
                <p className="text-sm text-slate-500">{results.length} {results.length === 1 ? "meal" : "meals"} found {query && `for "${query}"`}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {results.map((meal) => <MealCard key={meal.externalMealId} meal={meal} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
