export default function MealCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* Image */}
      <div className="skeleton aspect-[4/3] w-full" />

      {/* Body */}
      <div className="space-y-3 p-4">
        {/* Title */}
        <div className="skeleton h-4 w-3/4 rounded" />

        {/* Meta */}
        <div className="flex gap-2">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-1">
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}