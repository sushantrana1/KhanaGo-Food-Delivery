import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Grid3x3, Sparkles, ArrowRight, Search } from "lucide-react";

import { getCategoryList } from "../services/mealApi.js";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

/* ═══════════════════════════════════════════════════════
   INLINE SKELETON
   ═══════════════════════════════════════════════════════ */

function CategoryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="skeleton aspect-square w-full" />
      <div className="p-3">
        <div className="skeleton mx-auto h-3 w-20 rounded" />
      </div>
    </div>
  );
}

function CategoriesSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getCategoryList()
      .then((res) => {
        if (!cancelled) {
          setCategories(res.data.categories || []);
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
  }, []);

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-24 sm:pb-10">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50">
        {/* Blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-[300px] w-[300px] rounded-full bg-orange-200/30 blur-3xl sm:h-[400px] sm:w-[400px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[300px] w-[300px] rounded-full bg-red-200/20 blur-3xl sm:h-[400px] sm:w-[400px]" />

        <div className="container relative z-10 py-10 sm:py-14">
          <div className="mx-auto max-w-2xl text-center">

            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3.5 py-1.5 shadow-sm sm:mb-5 sm:px-4 sm:py-2">
              <Sparkles size={13} className="text-orange-500 sm:hidden" />
              <Sparkles size={15} className="hidden text-orange-500 sm:block" />
              <span className="text-xs font-semibold text-orange-600 sm:text-sm">
                Explore Our Menu
              </span>
            </div>

            {/* Title */}
            <div className="mb-3 flex items-center justify-center gap-2.5 sm:mb-4 sm:gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200 sm:h-14 sm:w-14">
                <Grid3x3 size={22} className="sm:hidden" />
                <Grid3x3 size={26} className="hidden sm:block" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Browse Categories
              </h1>
            </div>

            <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-500 sm:text-base">
              Discover delicious meals by category — from appetizers to desserts
              and everything in between.
            </p>

            {/* Category count */}
            {!loading && categories.length > 0 && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-3.5 py-1.5 shadow-md shadow-orange-200 sm:mt-6 sm:px-4 sm:py-2">
                <span className="text-sm font-black text-white sm:text-base">
                  {categories.length}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-100 sm:text-xs">
                  Categories Available
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ GRID ═══ */}
      <section className="container pt-6 sm:pt-10">

        {/* Loading */}
        {loading && <CategoriesSkeleton count={12} />}

        {/* Empty */}
        {!loading && categories.length === 0 && (
          <div className="mx-auto max-w-lg rounded-3xl border border-slate-100 bg-white py-14 text-center shadow-sm sm:py-20">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100 sm:h-24 sm:w-24">
              <Grid3x3 className="text-orange-500 sm:hidden" size={36} />
              <Grid3x3 className="hidden text-orange-500 sm:block" size={44} />
            </div>
            <h3 className="mb-2 text-lg font-black text-slate-800 sm:text-2xl">
              No categories found
            </h3>
            <p className="mx-auto mb-6 max-w-sm px-4 text-sm text-slate-500 sm:text-base">
              Something went wrong loading the categories. Try refreshing the
              page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:px-7 sm:text-base"
            >
              Retry
            </button>
          </div>
        )}

        {/* Categories grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.strCategory}
                to={`/categories/${cat.strCategory}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-100 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-orange-50">
                  <img
                    src={`https://www.themealdb.com/images/category/${cat.strCategory}.png`}
                    alt={cat.strCategory}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-900/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Arrow on hover */}
                  <div className="absolute right-2 top-2 flex h-8 w-8 translate-x-2 items-center justify-center rounded-full bg-white/95 text-orange-500 opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                    <ArrowRight size={14} />
                  </div>
                </div>

                {/* Name */}
                <div className="p-3 text-center">
                  <h3 className="truncate text-xs font-bold text-slate-800 transition-colors group-hover:text-orange-600 sm:text-sm">
                    {cat.strCategory}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && categories.length > 0 && (
          <div className="mt-10 flex flex-col items-center gap-3 sm:mt-14">
            <p className="text-center text-xs text-slate-500 sm:text-sm">
              Can&apos;t find what you&apos;re looking for?
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            >
              <Search size={15} />
              Search All Meals
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}