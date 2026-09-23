import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  Clock,
  Shield,
  Truck,
  RefreshCw,
  MapPin,
  Zap,
  ArrowRight,
  CheckCircle2,
  Utensils,
  Pizza,
  Sandwich,
  Soup,
  CakeSlice,
  Flame,
  Sparkles,
} from "lucide-react";

import MealCard from "../components/meals/MealCard.jsx";
import {
  getMeals,
  getRandomMeals,
  getCategories,
} from "../services/mealApi.js";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

/* ═══════════════════════════════════════════════════════
   INLINE SKELETONS (no extra files needed)
   ═══════════════════════════════════════════════════════ */

function SkeletonBox({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

function MealCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-9 w-9 rounded-full" />
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

function CategoryCarouselSkeleton({ count = 6 }) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-32 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sm:w-auto"
        >
          <div className="skeleton aspect-square w-full" />
          <div className="p-3">
            <div className="skeleton mx-auto h-3 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function HeroSkeleton() {
  return (
    <section className="bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-6">
            <SkeletonBox className="h-8 w-56 rounded-full" />
            <div className="space-y-3">
              <SkeletonBox className="h-12 w-full rounded-lg" />
              <SkeletonBox className="h-12 w-4/5 rounded-lg" />
            </div>
            <div className="space-y-2">
              <SkeletonBox className="h-4 w-full rounded" />
              <SkeletonBox className="h-4 w-3/4 rounded" />
            </div>
            <SkeletonBox className="h-16 w-full rounded-2xl" />
          </div>
          <div className="relative mx-auto h-[380px] w-full max-w-md sm:h-[440px] lg:h-[480px]">
            <SkeletonBox className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem]" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function Home() {
  const navigate = useNavigate();

  const [popular, setPopular] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [random, setRandom] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Section-level loading
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      navigate("/search");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await getRandomMeals(8);
      setRandom(res.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadMeals = async () => {
      try {
        const [mealsRes, randomRes] = await Promise.all([
          getMeals(1, 12),
          getRandomMeals(8),
        ]);
        if (!cancelled) {
          const meals = mealsRes.data.results || [];
          setPopular(meals);
          setRandom(randomRes.data.results || []);
          setFeatured(meals.filter((m) => m.isFeatured).slice(0, 4));
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load meals");
      } finally {
        if (!cancelled) setLoadingMeals(false);
      }
    };

    const loadCategories = async () => {
      try {
        const catRes = await getCategories();
        if (!cancelled) setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    };

    loadMeals();
    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="overflow-x-hidden bg-white pb-24 sm:pb-0">

      {/* ═══════════ HERO ═══════════ */}
      {loadingMeals && popular.length === 0 ? (
        <HeroSkeleton />
      ) : (
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50">
          <div className="pointer-events-none absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-orange-200/30 blur-3xl sm:h-[500px] sm:w-[500px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-32 h-[400px] w-[400px] rounded-full bg-red-200/20 blur-3xl sm:h-[500px] sm:w-[500px]" />

          <div className="pointer-events-none absolute top-28 right-[12%] h-4 w-4 rounded-full bg-orange-400 opacity-60" />
          <div className="pointer-events-none absolute top-48 right-[20%] h-2 w-2 rounded-full bg-red-400 opacity-60" />
          <div className="pointer-events-none absolute bottom-32 right-[15%] h-5 w-5 rounded-full bg-orange-300 opacity-50" />

          <div className="container relative z-10 py-6 sm:py-10 lg:py-14">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">

              {/* Left text */}
              <div className="max-w-2xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3.5 py-1.5 shadow-sm sm:px-4 sm:py-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
                  </span>
                  <span className="text-xs font-semibold text-orange-600 sm:text-sm">
                    Fast & Fresh Food Delivery
                  </span>
                </div>

                <h1 className="text-[2.5rem] font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl xl:text-7xl">
                  Delicious food,
                  <span className="mt-1 block bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent sm:mt-2">
                    delivered fast.
                  </span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-500 sm:mt-6 sm:text-lg">
                  Discover your favorite meals from local restaurants in{" "}
                  <span className="font-semibold text-slate-700">Kathmandu</span>,{" "}
                  <span className="font-semibold text-slate-700">Lalitpur</span> and{" "}
                  <span className="font-semibold text-slate-700">Bhaktapur</span>.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 sm:mt-8">
                  <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-orange-100/40 sm:flex-row">
                    <div className="flex min-w-0 flex-1 items-center px-3 sm:px-4">
                      <MapPin size={20} className="shrink-0 text-orange-500" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for food, restaurants..."
                        className="w-full bg-transparent px-3 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 sm:text-base"
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-orange-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-orange-600 hover:to-red-600 active:scale-[0.98]"
                    >
                      <Search size={18} />
                      Search Food
                    </button>
                  </div>
                </form>

                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5 text-xs text-slate-600 sm:mt-7 sm:gap-x-6 sm:text-sm">
                  {["Fresh & Quality", "Fast Delivery", "Secure Payment"].map((item) => (
                    <div key={item} className="flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-green-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right visual */}
              <div className="relative">
                <div className="relative mx-auto h-[380px] w-full max-w-md sm:h-[440px] lg:h-[480px]">
                  <div className="absolute inset-4 rotate-2 rounded-[2rem] bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 shadow-2xl shadow-orange-200/70 sm:inset-6 sm:rounded-[2.5rem] lg:inset-8 lg:rounded-[3rem]" />

                  <div className="absolute inset-0 rounded-[2rem] border border-orange-100 bg-white p-5 shadow-2xl sm:rounded-[2.5rem] sm:p-6 lg:rounded-[3rem] lg:p-8">
                    <div className="mb-5 flex items-center justify-between sm:mb-6 lg:mb-8">
                      <div>
                        <p className="text-xs text-slate-400 sm:text-sm">Hungry?</p>
                        <h3 className="text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl">
                          What&apos;s on your mind?
                        </h3>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 sm:h-12 sm:w-12 sm:rounded-2xl">
                        <Utensils size={20} className="text-orange-500 sm:hidden" />
                        <Utensils size={24} className="hidden text-orange-500 sm:block" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { Icon: Pizza, label: "Pizza", sub: "Hot & cheesy", bg: "bg-orange-50", color: "text-orange-500", hover: "hover:bg-orange-100" },
                        { Icon: Sandwich, label: "Burger", sub: "Juicy & fresh", bg: "bg-red-50", color: "text-red-500", hover: "hover:bg-red-100" },
                        { Icon: Soup, label: "Momos", sub: "KTM favorite", bg: "bg-amber-50", color: "text-amber-500", hover: "hover:bg-amber-100" },
                        { Icon: CakeSlice, label: "Desserts", sub: "Sweet treats", bg: "bg-emerald-50", color: "text-emerald-500", hover: "hover:bg-emerald-100" },
                      ].map(({ Icon, label, sub, bg, color, hover }) => (
                        <Link
                          to={`/search?q=${label}`}
                          key={label}
                          className={`group rounded-xl ${bg} ${hover} p-3 transition-all duration-300 active:scale-95 sm:rounded-2xl sm:p-5`}
                        >
                          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm sm:mb-4 sm:h-14 sm:w-14 sm:rounded-2xl">
                            <Icon size={20} className={`${color} sm:hidden`} />
                            <Icon size={28} className={`${color} hidden sm:block`} />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 sm:text-base">{label}</h4>
                          <p className="mt-0.5 text-[11px] text-slate-500 sm:mt-1 sm:text-xs">{sub}</p>
                        </Link>
                      ))}
                    </div>

                    <Link
                      to="/deals"
                      className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-3 text-white transition hover:shadow-lg hover:shadow-orange-200/60 active:scale-[0.98] sm:mt-5 sm:rounded-2xl sm:p-4"
                    >
                      <div>
                        <p className="text-[11px] font-medium opacity-90 sm:text-xs">Special offer</p>
                        <p className="text-sm font-bold sm:text-base">30% OFF your first order</p>
                      </div>
                      <ArrowRight size={20} className="sm:hidden" />
                      <ArrowRight size={22} className="hidden sm:block" />
                    </Link>
                  </div>

                  <div className="absolute -right-2 top-12 flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-xl sm:-right-5 sm:top-16 sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 sm:h-10 sm:w-10 sm:rounded-xl">
                      <Truck size={15} className="text-green-600 sm:hidden" />
                      <Truck size={19} className="hidden text-green-600 sm:block" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 sm:text-xs">Delivery</p>
                      <p className="text-xs font-bold text-slate-800 sm:text-sm">30-45 min</p>
                    </div>
                  </div>

                  <div className="absolute -left-2 bottom-16 flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-xl sm:-left-6 sm:bottom-20 sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 sm:h-10 sm:w-10 sm:rounded-xl">
                      <Star size={15} className="fill-amber-500 text-amber-500 sm:hidden" />
                      <Star size={19} className="hidden fill-amber-500 text-amber-500 sm:block" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 sm:text-xs">Rated</p>
                      <p className="text-xs font-bold text-slate-800 sm:text-sm">4.9 / 5</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ FEATURES (static, no skeleton) ═══════════ */}
      <section className="section pt-12 sm:pt-16">
        <div className="container">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {[
              { icon: Clock, title: "Fast Delivery", desc: "Get your favorite food in 30-45 minutes.", color: "orange" },
              { icon: Shield, title: "Secure Payment", desc: "Multiple safe and convenient payment options.", color: "green" },
              { icon: Truck, title: "Free Delivery", desc: "Enjoy free delivery on orders above Rs. 1000.", color: "blue" },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${
                      feature.color === "orange"
                        ? "bg-orange-50 text-orange-500"
                        : feature.color === "green"
                        ? "bg-green-50 text-green-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <Icon size={23} />
                  </div>
                  <h3 className="font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section className="section bg-slate-50 py-10 sm:py-14">
        <div className="container">
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <p className="mb-1 text-xs font-semibold text-orange-500 sm:text-sm">Explore</p>
              <h2 className="section-title text-2xl sm:text-3xl">Browse Categories</h2>
              <p className="section-subtitle text-sm sm:text-base">
                Find something delicious for every craving
              </p>
            </div>
            <Link
              to="/categories"
              className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 sm:flex"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loadingCategories ? (
            <CategoryCarouselSkeleton count={6} />
          ) : (
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 md:grid-cols-4 lg:grid-cols-6">
              {categories.slice(0, 12).map((cat) => (
                <Link
                  key={cat.strCategory}
                  to={`/categories/${cat.strCategory}`}
                  className="group w-32 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-auto"
                >
                  <div className="aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={cat.strCategoryThumb}
                      alt={cat.strCategory}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
                      {cat.strCategory}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            to="/categories"
            className="mt-5 flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-orange-500 transition hover:border-orange-200 hover:bg-orange-50 sm:hidden"
          >
            View All Categories <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ═══════════ POPULAR ═══════════ */}
      <section className="section py-10 sm:py-14">
        <div className="container">
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <p className="mb-1 text-xs font-semibold text-orange-500 sm:text-sm">
                Popular right now
              </p>
              <h2 className="section-title text-2xl sm:text-3xl">Popular Meals</h2>
              <p className="section-subtitle text-sm sm:text-base">
                Customer favorites you should try
              </p>
            </div>
            <Link
              to="/search"
              className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 sm:flex"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loadingMeals ? (
            <MealGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {popular.slice(0, 8).map((meal) => (
                <MealCard key={meal.externalMealId} meal={meal} />
              ))}
            </div>
          )}

          <Link
            to="/search"
            className="mt-5 flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-orange-500 transition hover:border-orange-200 hover:bg-orange-50 sm:hidden"
          >
            View All Meals <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ═══════════ FEATURED ═══════════ */}
      {(loadingMeals || featured.length > 0) && (
        <section className="section bg-orange-50/50 py-10 sm:py-14">
          <div className="container">
            <div className="mb-8 text-center sm:mb-10">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-600 shadow-sm sm:text-sm">
                <Sparkles size={13} />
                Chef&apos;s choice
              </div>
              <h2 className="section-title text-2xl sm:text-3xl">Featured Meals</h2>
              <p className="section-subtitle mx-auto max-w-xl text-sm sm:text-base">
                Handpicked dishes made for your next delicious meal.
              </p>
            </div>

            {loadingMeals ? (
              <MealGridSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {featured.map((meal) => (
                  <MealCard key={meal.externalMealId} meal={meal} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════ RANDOM ═══════════ */}
      <section className="section py-10 sm:py-14">
        <div className="container">
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <p className="mb-1 text-xs font-semibold text-orange-500 sm:text-sm">
                Feeling adventurous?
              </p>
              <h2 className="section-title text-2xl sm:text-3xl">Random Picks</h2>
              <p className="section-subtitle text-sm sm:text-base">
                Discover something new today
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-orange-500 transition hover:border-orange-200 hover:bg-orange-50 disabled:opacity-50 sm:gap-2 sm:px-4 sm:text-sm"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loadingMeals || refreshing ? (
            <MealGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {random.map((meal) => (
                <MealCard key={meal.externalMealId} meal={meal} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS (static) ═══════════ */}
      <section className="section bg-slate-950 py-14 text-white sm:py-20">
        <div className="container">
          <div className="mb-10 text-center sm:mb-12">
            <p className="mb-2 text-xs font-semibold text-orange-400 sm:text-sm">
              Simple & easy
            </p>
            <h2 className="text-3xl font-black sm:text-4xl">How It Works</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
              Order your favorite food in just a few simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {[
              { icon: Search, title: "Find Food", desc: "Browse restaurants and discover your favorite meals." },
              { icon: Utensils, title: "Choose Meal", desc: "Pick your favorite dishes and add them to your cart." },
              { icon: Zap, title: "Place Order", desc: "Choose your payment method and confirm your order." },
              { icon: Truck, title: "Enjoy", desc: "Sit back while we deliver your food fresh and fast." },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="group relative rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:bg-white/10 sm:p-6"
                >
                  <div className="mb-4 flex items-center justify-between sm:mb-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
                      <Icon size={20} className="sm:hidden" />
                      <Icon size={22} className="hidden sm:block" />
                    </div>
                    <span className="text-3xl font-black text-white/10 sm:text-4xl">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-bold sm:text-lg">{step.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400 sm:mt-2 sm:text-sm">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ REVIEWS (static) ═══════════ */}
      <section className="section py-10 sm:py-14">
        <div className="container">
          <div className="mb-8 text-center sm:mb-10">
            <p className="mb-1 text-xs font-semibold text-orange-500 sm:mb-2 sm:text-sm">
              Customer love
            </p>
            <h2 className="section-title text-2xl sm:text-3xl">What Our Customers Say</h2>
            <p className="section-subtitle text-sm sm:text-base">
              Thousands of food lovers trust us for their meals.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6">
            {[
              { name: "Alice Johnson", avatar: "AJ", text: "Amazing food and really fast delivery. The ordering experience is super easy." },
              { name: "Bob Smith", avatar: "BS", text: "Great variety of food and the prices are reasonable. I order here regularly." },
              { name: "Carol White", avatar: "CW", text: "Love the selection and quality. Finding something delicious is always easy." },
            ].map((review) => (
              <div
                key={review.name}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
              >
                <div className="mb-4 flex gap-1 sm:mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  &quot;{review.text}&quot;
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4 sm:mt-6 sm:pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-sm font-bold text-white sm:h-11 sm:w-11">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{review.name}</p>
                    <p className="text-xs text-slate-400">Verified customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="pb-16 sm:pb-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-orange-500 to-red-500 px-6 py-10 text-center shadow-2xl shadow-orange-200 sm:rounded-[2rem] sm:px-12 sm:py-16">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-black/5" />

            <div className="relative z-10">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm sm:text-sm">
                <Flame size={13} />
                Hungry already?
              </div>

              <h2 className="text-2xl font-black text-white sm:text-3xl md:text-4xl">
                Ready to satisfy your cravings?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-orange-100 sm:text-base">
                Find something delicious and get it delivered straight to your doorstep.
              </p>

              <Link
                to="/search"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-orange-600 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-orange-50 active:scale-[0.98] sm:mt-7 sm:px-7 sm:text-base"
              >
                Explore Food
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}