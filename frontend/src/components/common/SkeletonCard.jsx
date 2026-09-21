export default function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton w-full h-48 rounded-none"></div>
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 rounded w-3/4"></div>
        <div className="skeleton h-3 rounded w-1/2"></div>
        <div className="flex justify-between items-center">
          <div className="skeleton h-4 rounded w-1/4"></div>
          <div className="skeleton h-8 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}
