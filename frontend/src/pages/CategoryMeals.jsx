import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChefHat,
  Sparkles,
  Search,
  Grid3x3,
  Utensils,
} from "lucide-react";

import MealCard from "../components/meals/MealCard.jsx";
import { getMealsByCategory } from "../services/mealApi.js";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

/* ═══════════════════════════════════════════════════════
   INLINE SKELETON
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

function MealsSkeleton({ count = 8 }) {
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

export default function CategoryMeals() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getMealsByCategory(category)
      .then((res) => {
        if (!cancelled) {
          setMeals(res.data.results || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [category]);

  if (error) return <ErrorMessage message={error} />;

  const categoryImage = `https://www.themealdb.com/images/category/${category}.png`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-24 sm:pb-10">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50">
        {/* Blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-[300px] w-[300px] rounded-full bg-orange-200/30 blur-3xl sm:h-[400px] sm:w-[400px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[300px] w-[300px] rounded-full bg-red-200/20 blur-3xl sm:h-[400px] sm:w-[400px]" />

        <div className="container relative z-10 py-6 sm:py-10">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-orange-500 sm:mb-6"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">

            {/* Category image */}
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-white shadow-xl shadow-orange-100/60 sm:h-28 sm:w-28">
                <img
                  src={categoryImage}
                  alt={category}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://www.themealdb.com/images/category/Miscellaneous.png";
                  }}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-orange-500 shadow-md">
                <ChefHat size={14} className="text-white" />
              </div>
            </div>

            {/* Title block */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-white px-3 py-1 shadow-sm">
                <Sparkles size={11} className="text-orange-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 sm:text-xs">
                  Category
                </span>
              </div>

              <h1 className="text-2xl font-black capitalize tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                {category}
              </h1>

              <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                {loading
                  ? "Loading delicious meals..."
                  : `${meals.length} ${meals.length === 1 ? "meal" : "meals"} available`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTENT ═══ */}
      <section className="container pt-6 sm:pt-10">

        {/* Loading */}
        {loading && <MealsSkeleton count={8} />}

        {/* Empty */}
        {!loading && meals.length === 0 && (
          <div className="mx-auto max-w-lg rounded-3xl border border-slate-100 bg-white py-14 text-center shadow-sm sm:py-20">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100 sm:h-24 sm:w-24">
              <Utensils className="text-orange-500 sm:hidden" size={36} />
              <Utensils className="hidden text-orange-500 sm:block" size={44} />
            </div>
            <h3 className="mb-2 text-lg font-black text-slate-800 sm:text-2xl">
              No meals in this category
            </h3>
            <p className="mx-auto mb-6 max-w-sm px-4 text-sm text-slate-500 sm:text-base">
              Check back later or explore other categories for something
              delicious.
            </p>
            <div className="flex flex-col items-center justify-center gap-2.5 px-4 sm:flex-row sm:gap-3">
              <Link
                to="/categories"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
              >
                <Grid3x3 size={16} />
                Browse Categories
              </Link>
              <Link
                to="/search"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 sm:w-auto"
              >
                <Search size={16} />
                Search Meals
              </Link>
            </div>
          </div>
        )}

        {/* Meals grid */}
        {!loading && meals.length > 0 && (
          <>
            {/* Section header */}
            <div className="mb-4 flex items-end justify-between gap-3 sm:mb-6">
              <div>
                <div className="flex items-center gap-1.5">
                  <ChefHat
                    size={14}
                    className="text-orange-500 sm:hidden"
                  />
                  <ChefHat
                    size={16}
                    className="hidden text-orange-500 sm:block"
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 sm:text-xs">
                    All {category} Meals
                  </span>
                </div>
                <h2 className="mt-1 text-lg font-black text-slate-900 sm:text-xl">
                  Pick Your Favorite
                </h2>
              </div>

              <Link
                to="/categories"
                className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 sm:flex sm:text-sm"
              >
                <Grid3x3 size={14} />
                All Categories
              </Link>
            </div>

            {/* Grid — 2 columns on mobile */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {meals.map((meal) => (
                <MealCard key={meal.externalMealId} meal={meal} />
              ))}
            </div>

            {/* Bottom navigation */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-3">
              <Link
                to="/categories"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 sm:w-auto"
              >
                <Grid3x3 size={15} />
                Browse All Categories
              </Link>
              <Link
                to="/search"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
              >
                <Search size={15} />
                Search More
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}