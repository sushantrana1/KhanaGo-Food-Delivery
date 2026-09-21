export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16 sm:py-20">
      <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
