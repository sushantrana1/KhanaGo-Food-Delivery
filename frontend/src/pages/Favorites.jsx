import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Search, Sparkles } from "lucide-react";

import MealCard from "../components/meals/MealCard.jsx";
import { getFavorites, removeFavorite } from "../services/favoriteApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/common/Toast.jsx";
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

function FavoritesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <MealCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function Favorites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // ── Fetch ──
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setLoading(false);
      return;
    }
    getFavorites()
      .then((res) => {
        if (!cancelled) setItems(res.data.results || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // ── Remove with animation ──
  const handleRemove = async (meal) => {
    const mealId = meal.externalMealId || meal.mealId || meal._id;
    setRemovingId(mealId);

    try {
      await removeFavorite(mealId);
      // small delay for animation
      setTimeout(() => {
        setItems((prev) =>
          prev.filter(
            (i) => (i.externalMealId || i.mealId || i._id) !== mealId
          )
        );
        setRemovingId(null);
      }, 200);
      addToast("Removed from favorites", "success");
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      setRemovingId(null);
      addToast("Failed to remove favorite", "error");
    }
  };

  // ── Not logged in ──
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-24 sm:pb-10">
        <div className="container py-5 sm:py-7">
          <div className="mx-auto max-w-md rounded-3xl border border-slate-100 bg-white py-14 text-center shadow-sm sm:py-20">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100 sm:h-24 sm:w-24">
              <Heart className="text-orange-500 sm:hidden" size={36} />
              <Heart className="hidden text-orange-500 sm:block" size={44} />
            </div>
            <h3 className="mb-2 text-lg font-black text-slate-800 sm:text-2xl">
              Login to see favorites
            </h3>
            <p className="mx-auto mb-6 max-w-sm px-4 text-sm text-slate-500 sm:text-base">
              Sign in to save and view your favorite meals
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:px-7 sm:text-base"
            >
              <Heart size={18} />
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-24 sm:pb-10">
      <div className="container py-5 sm:py-7">

        {/* ── Header ── */}
        <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-pink-500 shadow-md shadow-red-200 sm:h-10 sm:w-10">
                <Heart size={16} className="fill-white text-white sm:hidden" />
                <Heart size={18} className="hidden fill-white text-white sm:block" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  My Favorites
                </h1>
                <p className="text-xs text-slate-500 sm:text-sm">
                  {loading
                    ? "Loading..."
                    : `${items.length} ${items.length === 1 ? "meal" : "meals"} saved`}
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/search"
            className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 sm:flex"
          >
            <Search size={15} />
            Discover More
          </Link>
        </div>

        {/* ── Loading ── */}
        {loading && <FavoritesSkeleton />}

        {/* ── Empty ── */}
        {!loading && items.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white py-14 text-center shadow-sm sm:py-20">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-pink-100 sm:h-24 sm:w-24">
              <Heart className="text-red-500 sm:hidden" size={36} />
              <Heart className="hidden text-red-500 sm:block" size={44} />
            </div>
            <h3 className="mb-2 text-lg font-black text-slate-800 sm:text-2xl">
              No favorites yet
            </h3>
            <p className="mx-auto mb-6 max-w-sm px-4 text-sm text-slate-500 sm:text-base">
              Save meals you love by tapping the heart icon on any meal card.
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:px-7 sm:text-base"
            >
              <Sparkles size={16} />
              Explore Meals
            </Link>
          </div>
        )}

        {/* ── Grid ── */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {items.map((meal) => {
              const mealId = meal.externalMealId || meal.mealId || meal._id;
              const isRemoving = removingId === mealId;

              return (
                <div
                  key={mealId}
                  className={`relative transition-all duration-300 ${
                    isRemoving
                      ? "scale-90 opacity-0"
                      : "scale-100 opacity-100"
                  }`}
                >
                  <MealCard meal={meal} />

                  {/* Remove button (floating heart) */}
                  <button
                    onClick={() => handleRemove(meal)}
                    aria-label="Remove from favorites"
                    className="absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/40 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-red-600 active:scale-95 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
                  >
                    <Heart
                      size={15}
                      fill="currentColor"
                      className="sm:hidden"
                    />
                    <Heart
                      size={17}
                      fill="currentColor"
                      className="hidden sm:block"
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Mobile "Discover more" ── */}
        {!loading && items.length > 0 && (
          <Link
            to="/search"
            className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-orange-600 transition hover:border-orange-200 hover:bg-orange-50 sm:hidden"
          >
            <Search size={16} />
            Discover More Meals
          </Link>
        )}
      </div>
    </div>
  );
}