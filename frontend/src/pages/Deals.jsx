import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Tag, Sparkles, Zap, Clock, Search } from "lucide-react";

import DealCard from "../components/deals/DealCard.jsx";
import { getDeals } from "../services/dealApi.js";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

/* ═══════════════════════════════════════════════════════
   INLINE SKELETON
   ═══════════════════════════════════════════════════════ */

function DealCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="skeleton aspect-[16/10] w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-5 w-2/3 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="flex items-center gap-2">
          <div className="skeleton h-6 w-20 rounded" />
          <div className="skeleton h-4 w-14 rounded" />
        </div>
        <div className="skeleton h-2 w-full rounded-full" />
        <div className="flex items-center justify-between pt-1">
          <div className="skeleton h-6 w-24 rounded" />
          <div className="skeleton h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function DealsSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <DealCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getDeals();
        if (!cancelled) setDeals(res.data.results || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClaimed = (dealId) => {
    setDeals((prev) => prev.filter((d) => d._id !== dealId));
  };

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pb-24 sm:pb-10">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-red-500">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-yellow-200 blur-3xl" />
        </div>

        {/* Floating sparkles */}
        <Sparkles
          size={14}
          className="absolute right-8 top-8 text-white/60 sm:hidden"
        />
        <Sparkles
          size={20}
          className="absolute right-12 top-12 hidden text-white/60 sm:block"
        />
        <Sparkles
          size={16}
          className="absolute bottom-6 left-8 text-white/40 sm:hidden"
        />

        <div className="container relative z-10 py-10 sm:py-14 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-3.5 py-1.5 backdrop-blur-sm sm:mb-5 sm:px-4 sm:py-2">
              <Zap size={13} className="fill-yellow-200 text-yellow-200 sm:hidden" />
              <Zap
                size={15}
                className="hidden fill-yellow-200 text-yellow-200 sm:block"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-white sm:text-sm">
                Limited Time Offers
              </span>
            </div>

            <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
              Today&apos;s Hot Deals
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-orange-100 sm:text-base md:text-lg">
              Grab exclusive discounts on your favorite meals — hurry, offers
              end soon!
            </p>

            {/* Stats */}
            {!loading && deals.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8 sm:gap-4">
                <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 backdrop-blur-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90">
                    <Flame size={16} className="text-orange-500 sm:hidden" />
                    <Flame size={18} className="hidden text-orange-500 sm:block" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-black leading-none text-white sm:text-xl">
                      {deals.length}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-100 sm:text-xs">
                      Active Deals
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 backdrop-blur-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90">
                    <Clock size={16} className="text-orange-500 sm:hidden" />
                    <Clock size={18} className="hidden text-orange-500 sm:block" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-black leading-none text-white sm:text-xl">
                      Today
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-100 sm:text-xs">
                      Limited Time
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom curve */}
        <div className="absolute inset-x-0 bottom-0 h-8 rounded-t-[2rem] bg-white sm:h-12 sm:rounded-t-[3rem]" />
      </section>

      {/* ═══ CONTENT ═══ */}
      <section className="container pt-6 sm:pt-10">

        {/* ── Loading ── */}
        {loading && <DealsSkeleton count={6} />}

        {/* ── Empty ── */}
        {!loading && deals.length === 0 && (
          <div className="mx-auto max-w-lg rounded-3xl border border-slate-100 bg-white py-14 text-center shadow-sm sm:py-20">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100 sm:h-24 sm:w-24">
              <Tag className="text-orange-500 sm:hidden" size={36} />
              <Tag className="hidden text-orange-500 sm:block" size={44} />
            </div>
            <h3 className="mb-2 text-lg font-black text-slate-800 sm:text-2xl">
              No active deals right now
            </h3>
            <p className="mx-auto mb-6 max-w-sm px-4 text-sm text-slate-500 sm:text-base">
              Check back later for amazing discounts and offers.
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:px-7 sm:text-base"
            >
              <Search size={16} />
              Explore Meals
            </Link>
          </div>
        )}

        {/* ── Deals grid ── */}
        {!loading && deals.length > 0 && (
          <>
            {/* Section header */}
            <div className="mb-5 flex items-end justify-between gap-3 sm:mb-6">
              <div>
                <div className="flex items-center gap-1.5">
                  <Flame
                    size={16}
                    className="fill-orange-500 text-orange-500 sm:hidden"
                  />
                  <Flame
                    size={18}
                    className="hidden fill-orange-500 text-orange-500 sm:block"
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 sm:text-sm">
                    Live Now
                  </span>
                </div>
                <h2 className="mt-1 text-lg font-black text-slate-900 sm:text-2xl">
                  Grab Before It&apos;s Gone
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {deals.map((deal) => (
                <DealCard
                  key={deal._id}
                  deal={deal}
                  onClaimed={handleClaimed}
                />
              ))}
            </div>

            {/* Info footer */}
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-orange-100 bg-orange-50/60 p-4 sm:mt-10 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Sparkles size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 sm:text-base">
                  How deals work
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 sm:text-sm">
                  Tap the deal, place your order, and the discount is applied
                  automatically at checkout. Limited quantities — first come,
                  first served!
                </p>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}