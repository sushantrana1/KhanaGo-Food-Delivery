export default function CategorySkeleton({ count = 6 }) {
  return (
    <>
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
    </>
  );
}