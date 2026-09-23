import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  Flame,
  TrendingUp,
  Sparkles,
  X,
  MapPin,
  ArrowRight,
} from "lucide-react";

import MealCard from "../components/meals/MealCard.jsx";
import {
  searchMeals,
  getMealsByCategory,
  getMealsByArea,
  getMealsByIngredient,
  getCategoryList,
  getAreaList,
  getIngredientList,
  getRandomMeals,
} from "../services/mealApi.js";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

/* ═══════════════════════════════════════════════════════
   INLINE SKELETONS
   ═══════════════════════════════════════════════════════ */

function MealCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
        <div className="skeleton h-3.5 w-3/4 rounded sm:h-4" />
        <div className="flex gap-1.5">
          <div className="skeleton h-2.5 w-14 rounded sm:h-3 sm:w-16" />
          <div className="skeleton h-2.5 w-10 rounded sm:h-3 sm:w-12" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="skeleton h-4 w-14 rounded sm:h-5 sm:w-16" />
          <div className="skeleton h-7 w-16 rounded-lg sm:h-9 sm:w-20 sm:rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function MealGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <MealCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingSuggested, setLoadingSuggested] = useState(true);
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
    setQuery("");
    setResults([]);
  };

  const performSearch = useCallback(
    async (q, overrideFilters = null) => {
      setLoading(true);
      setError("");
      const f = overrideFilters || filters;
      try {
        let res;
        if (f.category) res = await getMealsByCategory(f.category);
        else if (f.area) res = await getMealsByArea(f.area);
        else if (f.ingredient) res = await getMealsByIngredient(f.ingredient);
        else if (q) res = await searchMeals(q);
        else res = { data: { results: [] } };
        setResults(res.data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cat, area, ing] = await Promise.all([
          getCategoryList(),
          getAreaList(),
          getIngredientList(),
        ]);
        if (!cancelled) {
          setCategories(cat.data.categories || []);
          setAreas(area.data.areas || []);
          setIngredients(ing.data.ingredients || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load filters");
      } finally {
        if (!cancelled) setLoadingFilters(false);
      }

      try {
        const randomRes = await getRandomMeals(8);
        if (!cancelled) setSuggestedMeals(randomRes.data.results || []);
      } catch {
        // optional
      } finally {
        if (!cancelled) setLoadingSuggested(false);
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

  const hasActiveFilters =
    filters.category || filters.area || filters.ingredient;
  const popularCategories = categories.slice(0, 6);

  return (
    <div className="min-h-screen bg-white pb-24 sm:pb-0">

      {/* ═══════════════════════════════════════════════
          HERO — matches Home page style
          ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-[300px] w-[300px] rounded-full bg-orange-200/30 blur-3xl sm:h-[400px] sm:w-[400px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[300px] w-[300px] rounded-full bg-red-200/20 blur-3xl sm:h-[400px] sm:w-[400px]" />

        <div className="container relative z-10 py-6 sm:py-10 lg:py-14">
          <div className="mb-6 text-center sm:mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3.5 py-1.5 shadow-sm sm:mb-6 sm:px-4 sm:py-2">
              <Sparkles size={14} className="text-orange-500 sm:hidden" />
              <Sparkles size={16} className="hidden text-orange-500 sm:block" />
              <span className="text-xs font-semibold text-orange-600 sm:text-sm">
                Explore delicious meals
              </span>
            </div>

            <h1 className="mb-3 text-[1.75rem] font-black leading-[1.1] tracking-tight text-slate-900 sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
              Find Your Next Meal
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-lg">
              Search from hundreds of recipes, cuisines, and ingredients
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-orange-100/40 sm:flex-row">
              <div className="relative flex-1">
                <MapPin
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-orange-500"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search meals, cuisines, ingredients..."
                  className="w-full rounded-xl bg-transparent py-3 pl-11 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 sm:py-4 sm:pl-12 sm:text-base"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-orange-600 hover:to-red-600 active:scale-[0.98] sm:px-8 sm:py-4"
              >
                <SearchIcon size={18} />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Quick category chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-6">
            {loadingFilters ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="skeleton h-8 w-20 rounded-full sm:w-24"
                  />
                ))}
              </>
            ) : (
              popularCategories.map((cat) => (
                <button
                  key={cat.strCategory}
                  onClick={() => {
                    setQuery("");
                    const newFilters = {
                      category: cat.strCategory,
                      area: "",
                      ingredient: "",
                    };
                    setFilters(newFilters);
                    setActiveFilter(null);
                    performSearch("", newFilters);
                  }}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:py-2 sm:text-sm ${
                    filters.category === cat.strCategory
                      ? "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-200"
                      : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  {cat.strCategory}
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FILTERS + RESULTS
          ═══════════════════════════════════════════════ */}
      <section className="container py-6 sm:py-10">

        {/* Filter chips row */}
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6 sm:gap-3">
          <button
            onClick={() => toggleFilter("category")}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
              activeFilter === "category" || filters.category
                ? "border-orange-300 bg-orange-50 text-orange-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            }`}
          >
            <SlidersHorizontal size={14} />
            Category
            {filters.category && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  const newFilters = { ...filters, category: "" };
                  setFilters(newFilters);
                  performSearch(query, newFilters);
                }}
                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600"
              >
                <X size={10} />
              </span>
            )}
          </button>

          <button
            onClick={() => toggleFilter("area")}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
              activeFilter === "area" || filters.area
                ? "border-orange-300 bg-orange-50 text-orange-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            }`}
          >
            <Flame size={14} />
            Area
            {filters.area && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  const newFilters = { ...filters, area: "" };
                  setFilters(newFilters);
                  performSearch(query, newFilters);
                }}
                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600"
              >
                <X size={10} />
              </span>
            )}
          </button>

          <button
            onClick={() => toggleFilter("ingredient")}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
              activeFilter === "ingredient" || filters.ingredient
                ? "border-orange-300 bg-orange-50 text-orange-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            }`}
          >
            <TrendingUp size={14} />
            Ingredient
            {filters.ingredient && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  const newFilters = { ...filters, ingredient: "" };
                  setFilters(newFilters);
                  performSearch(query, newFilters);
                }}
                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600"
              >
                <X size={10} />
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 sm:px-4 sm:text-sm"
            >
              <X size={14} />
              Clear All
            </button>
          )}
        </div>

        {/* Active filter selector panel */}
        {activeFilter && (
          <div className="mb-5 animate-fade-in-up rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <h3 className="text-sm font-semibold capitalize text-slate-800 sm:text-lg">
                {activeFilter === "category" && "Select Category"}
                {activeFilter === "area" && "Select Area"}
                {activeFilter === "ingredient" && "Select Ingredient"}
              </h3>
              <button
                onClick={() => setActiveFilter(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:h-8 sm:w-8"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex max-h-56 flex-wrap gap-1.5 overflow-y-auto pr-1 sm:max-h-64 sm:gap-2">
              {(activeFilter === "category"
                ? categories
                : activeFilter === "area"
                ? areas
                : ingredients
              ).map((item) => {
                const value =
                  activeFilter === "category"
                    ? item.strCategory
                    : activeFilter === "area"
                    ? item.strArea
                    : item.strIngredient;
                const isActive = filters[activeFilter] === value;
                return (
                  <button
                    key={value}
                    onClick={() => {
                      const newFilters = {
                        category: "",
                        area: "",
                        ingredient: "",
                        [activeFilter]: value,
                      };
                      setFilters(newFilters);
                      setActiveFilter(null);
                      performSearch(query, newFilters);
                    }}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2 sm:text-sm ${
                      isActive
                        ? "border-orange-400 bg-orange-500 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <ErrorMessage
            message={error}
            retry={() => performSearch(query)}
          />
        )}

        {/* ═══ LOADING ═══ */}
        {loading && (
          <>
            <div className="mb-3 sm:mb-5">
              <div className="skeleton h-4 w-32 rounded" />
            </div>
            <MealGridSkeleton count={8} />
          </>
        )}

        {/* ═══ Trending (initial view) ═══ */}
        {!loading &&
          results.length === 0 &&
          !hasActiveFilters &&
          !query && (
            <div className="mb-6 sm:mb-12">
              <div className="mb-4 flex items-center gap-2 sm:mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 sm:h-10 sm:w-10 sm:rounded-xl">
                  <Flame className="text-orange-500" size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800 sm:text-xl">
                    Trending Now
                  </h2>
                  <p className="text-[11px] text-slate-500 sm:text-sm">
                    Popular picks from our menu
                  </p>
                </div>
              </div>

              {loadingSuggested ? (
                <MealGridSkeleton count={8} />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                  {suggestedMeals.map((meal) => (
                    <MealCard key={meal.externalMealId} meal={meal} />
                  ))}
                </div>
              )}
            </div>
          )}

        {/* ═══ Empty — start searching ═══ */}
        {!loading &&
          results.length === 0 &&
          !hasActiveFilters &&
          !query &&
          !loadingSuggested && (
            <div className="py-10 text-center sm:py-20">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 sm:h-16 sm:w-16">
                <SearchIcon className="text-slate-400" size={24} />
              </div>
              <h3 className="mb-2 text-base font-semibold text-slate-700 sm:text-xl">
                Start Your Culinary Journey
              </h3>
              <p className="mx-auto max-w-md text-xs text-slate-500 sm:text-base">
                Search by meal name, cuisine, or ingredient. Use filters to
                narrow down your perfect dish.
              </p>
            </div>
          )}

        {/* ═══ No results ═══ */}
        {!loading &&
          results.length === 0 &&
          (hasActiveFilters || query) && (
            <div className="py-10 text-center sm:py-20">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 sm:h-16 sm:w-16">
                <SearchIcon className="text-slate-400" size={24} />
              </div>
              <h3 className="mb-2 text-base font-semibold text-slate-700 sm:text-xl">
                No meals found
              </h3>
              <p className="mx-auto mb-5 max-w-md text-xs text-slate-500 sm:text-base">
                Try adjusting your search or filters to discover more meals.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:px-6 sm:py-3 sm:text-base"
              >
                <X size={16} />
                Clear Filters
              </button>
            </div>
          )}

        {/* ═══ Results ═══ */}
        {!loading && results.length > 0 && (
          <>
            <div className="mb-4 sm:mb-6">
              <p className="text-xs text-slate-500 sm:text-base">
                <span className="font-semibold text-slate-700">
                  {results.length}
                </span>{" "}
                {results.length === 1 ? "meal" : "meals"} found
                {query && (
                  <>
                    {" "}
                    for{" "}
                    <span className="font-semibold text-orange-600">
                      &quot;{query}&quot;
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* ✅ Mobile: 2 columns with proper spacing */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {results.map((meal) => (
                <MealCard key={meal.externalMealId} meal={meal} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}