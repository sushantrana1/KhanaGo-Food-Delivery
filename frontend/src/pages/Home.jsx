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
} from "lucide-react";

import MealCard from "../components/meals/MealCard.jsx";
import {
  getMeals,
  getRandomMeals,
  getCategories,
} from "../services/mealApi.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

export default function Home() {
  const navigate = useNavigate();

  const [popular, setPopular] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [random, setRandom] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

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
    const load = async () => {
      try {
        const [mealsRes, randomRes, catRes] = await Promise.all([
          getMeals(1, 12),
          getRandomMeals(8),
          getCategories(),
        ]);

        const meals = mealsRes.data.results || [];

        if (!cancelled) {
          setPopular(meals);
          setRandom(randomRes.data.results || []);
          setCategories(catRes.data.categories || []);
          setFeatured(meals.filter((meal) => meal.isFeatured).slice(0, 4));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load meals");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="overflow-hidden bg-white">
      {/* HERO */}
      <section className="relative min-h-[680px] lg:min-h-[760px] flex items-center bg-gradient-to-br from-orange-50 via-white to-red-50">
        {/* Background decorations */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-[500px] h-[500px] rounded-full bg-red-200/20 blur-3xl" />

        <div className="absolute top-28 right-[12%] w-4 h-4 bg-orange-400 rounded-full opacity-60" />
        <div className="absolute top-48 right-[20%] w-2 h-2 bg-red-400 rounded-full opacity-60" />
        <div className="absolute bottom-32 right-[15%] w-5 h-5 bg-orange-300 rounded-full opacity-50" />

        <div className="container relative z-10 py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* HERO CONTENT */}
            <div className="max-w-2xl relative -top-20">
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-orange-100 shadow-sm px-4 py-2 mb-7">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
                </span>

                <span className="text-xs sm:text-sm font-semibold text-orange-600">
                  Fast & Fresh Food Delivery
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] text-slate-900">
                Delicious food,
                <span className="block mt-2 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent">
                  delivered fast.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base sm:text-lg lg:text-xl leading-relaxed text-slate-500">
                Discover your favorite meals from local restaurants in
                Kathmandu, Lalitpur and Bhaktapur. Fresh food, great prices and
                fast delivery.
              </p>

              {/* SEARCH */}
              <form onSubmit={handleSubmit} className="mt-8">
                <div className="flex flex-col sm:flex-row gap-2 rounded-2xl bg-white p-2 border border-slate-200 shadow-xl shadow-orange-100/40">
                  <div className="flex items-center flex-1 min-w-0 px-3 sm:px-4">
                    <MapPin
                      size={21}
                      className="text-orange-500 flex-shrink-0"
                    />

                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search for food, restaurants..."
                      className="w-full bg-transparent outline-none px-3 py-3 text-sm sm:text-base text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 sm:px-8 py-3.5 font-semibold shadow-lg shadow-orange-200 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <Search size={19} />
                    Search Food
                  </button>
                </div>
              </form>

              {/* BENEFITS */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 mt-7 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-green-500" />
                  <span>Fresh & Quality</span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-green-500" />
                  <span>Fast Delivery</span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-green-500" />
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="relative hidden lg:block">
              <div className="relative -top-25 h-[480px]">
                {/* Main gradient card */}
                <div className="absolute top-8 left-8 right-8 bottom-8 rounded-[3rem] bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 shadow-2xl shadow-orange-200/70 rotate-2" />

                {/* White content card */}
                <div className="absolute top-0 left-0 right-0 bottom-0 rounded-[3rem] bg-white border border-orange-100 shadow-2xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-sm text-slate-400">Hungry?</p>
                      <h3 className="text-2xl font-bold text-slate-900">
                        What&apos;s on your mind?
                      </h3>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                      <Utensils size={24} className="text-orange-500" />
                    </div>
                  </div>

                  {/* Food category cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group rounded-2xl bg-orange-50 p-5 hover:bg-orange-100 transition-colors">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-4">
                        <Pizza size={28} className="text-orange-500" />
                      </div>

                      <h4 className="font-bold text-slate-800">Pizza</h4>

                      <p className="text-xs text-slate-500 mt-1">
                        Hot & cheesy
                      </p>
                    </div>

                    <div className="group rounded-2xl bg-red-50 p-5 hover:bg-red-100 transition-colors">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-4">
                        <Sandwich size={28} className="text-red-500" />
                      </div>

                      <h4 className="font-bold text-slate-800">Burger</h4>

                      <p className="text-xs text-slate-500 mt-1">
                        Juicy & fresh
                      </p>
                    </div>

                    <div className="group rounded-2xl bg-amber-50 p-5 hover:bg-amber-100 transition-colors">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-4">
                        <Soup size={28} className="text-amber-500" />
                      </div>

                      <h4 className="font-bold text-slate-800">Momos</h4>

                      <p className="text-xs text-slate-500 mt-1">
                        Kathmandu favorite
                      </p>
                    </div>

                    <div className="group rounded-2xl bg-emerald-50 p-5 hover:bg-emerald-100 transition-colors">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-4">
                        <CakeSlice size={28} className="text-emerald-500" />
                      </div>

                      <h4 className="font-bold text-slate-800">Desserts</h4>

                      <p className="text-xs text-slate-500 mt-1">
                        Sweet treats
                      </p>
                    </div>
                  </div>

                  {/* Bottom deal */}
                  <div className="mt-5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium opacity-90">
                        Special offer
                      </p>

                      <p className="font-bold">30% OFF your first order</p>
                    </div>

                    <ArrowRight size={22} />
                  </div>
                </div>

                {/* Floating delivery badge */}
                <div className="absolute -right-5 top-16 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <Truck size={19} className="text-green-600" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Delivery</p>
                    <p className="font-bold text-slate-800 text-sm">
                      30-45 min
                    </p>
                  </div>
                </div>

                {/* Floating rating badge */}
                <div className="absolute -left-6 bottom-20 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Star size={19} className="text-amber-500 fill-amber-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="container relative -top-30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Clock,
                title: "Fast Delivery",
                desc: "Get your favorite food in 30-45 minutes.",
                color: "orange",
              },
               {
                icon: Shield,
                title: "Secure Payment",
                desc: "Multiple safe and convenient payment options.",
                color: "green",
              },
              {
                icon: Truck,
                title: "Free Delivery",
                desc: "Enjoy free delivery on orders above Rs. 1000.",
                color: "blue",
              },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
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

                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section bg-slate-50">
        <div className="container relative -top-35">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-orange-500 mb-1">
                Explore
              </p>

              <h2 className="section-title">Browse Categories</h2>

              <p className="section-subtitle">
                Find something delicious for every craving
              </p>
            </div>

            <Link
              to="/categories"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((cat) => (
              <Link
                key={cat.strCategory}
                to={`/categories/${cat.strCategory}`}
                className="group overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={cat.strCategoryThumb}
                    alt={cat.strCategory}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                <div className="p-3 text-center">
                  <h3 className="font-semibold text-sm text-slate-800 truncate">
                    {cat.strCategory}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR */}
      <section className="section relative -top-40">
        <div className="container">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-orange-500 mb-1">
                Popular right now
              </p>

              <h2 className="section-title">Popular Meals</h2>

              <p className="section-subtitle">
                Customer favorites you should try
              </p>
            </div>

            <Link
              to="/search"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {popular.slice(0, 8).map((meal) => (
              <MealCard key={meal.externalMealId} meal={meal} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="section bg-orange-50/50">
          <div className="container">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-orange-500 mb-1">
                Chef&apos;s choice
              </p>

              <h2 className="section-title">Featured Meals</h2>

              <p className="section-subtitle max-w-xl mx-auto">
                Handpicked dishes made for your next delicious meal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map((meal) => (
                <MealCard key={meal.externalMealId} meal={meal} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RANDOM */}
      <section className="section relative -top-50">
        <div className="container">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-orange-500 mb-1">
                Feeling adventurous?
              </p>

              <h2 className="section-title">Random Picks</h2>

              <p className="section-subtitle">Discover something new today</p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {random.map((meal) => (
              <MealCard key={meal.externalMealId} meal={meal} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section relative -top-40 bg-slate-950 text-white">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-orange-400 mb-2">
              Simple & easy
            </p>

            <h2 className="text-3xl sm:text-4xl font-black">How It Works</h2>

            <p className="text-slate-400 mt-3 max-w-xl mx-auto">
              Order your favorite food in just a few simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Search,
                title: "Find Food",
                desc: "Browse restaurants and discover your favorite meals.",
              },
              {
                icon: Utensils,
                title: "Choose Meal",
                desc: "Pick your favorite dishes and add them to your cart.",
              },
              {
                icon: Zap,
                title: "Place Order",
                desc: "Choose your payment method and confirm your order.",
                color: "orange",
              },
              {
                icon: Truck,
                title: "Enjoy",
                desc: "Sit back while we deliver your food fresh and fast.",
              },
            ].map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="relative rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                      <Icon size={22} />
                    </div>

                    <span className="text-4xl font-black text-white/10">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg">{step.title}</h3>

                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section relative -top-30">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-orange-500 mb-2">
              Customer love
            </p>

            <h2 className="section-title">What Our Customers Say</h2>

            <p className="section-subtitle">
              Thousands of food lovers trust us for their meals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Alice Johnson",
                avatar: "AJ",
                text: "Amazing food and really fast delivery. The ordering experience is super easy.",
              },
              {
                name: "Bob Smith",
                avatar: "BS",
                text: "Great variety of food and the prices are reasonable. I order here regularly.",
              },
              {
                name: "Carol White",
                avatar: "CW",
                text: "Love the selection and quality. Finding something delicious is always easy.",
              },
            ].map((review) => (
              <div
                key={review.name}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                <p className="text-slate-600 leading-relaxed text-sm">
                  &quot;{review.text}&quot;
                </p>

                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center font-bold text-sm">
                    {review.avatar}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {review.name}
                    </p>

                    <p className="text-xs text-slate-400">Verified customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="pb-16 sm:pb-24 relative -top-15">
        <div className="container">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-orange-500 to-red-500 px-6 sm:px-12 py-12 sm:py-16 text-center shadow-2xl shadow-orange-200">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-black/5" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Ready to satisfy your cravings?
              </h2>

              <p className="text-orange-100 mt-3 max-w-xl mx-auto">
                Find something delicious and get it delivered straight to your
                doorstep.
              </p>

              <Link
                to="/search"
                className="inline-flex items-center gap-2 mt-7 bg-white text-orange-600 hover:bg-orange-50 px-7 py-3.5 rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5"
              >
                Explore Food
                <ArrowRight size={19} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
