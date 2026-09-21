export default function ErrorMessage({ message, retry }) {
  return (
    <div className="text-center py-12 sm:py-20 px-4">
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <p className="text-red-500 mb-4 text-sm sm:text-base font-medium">{message || "Something went wrong"}</p>
        {retry && <button onClick={retry} className="btn-primary">Try Again</button>}
      </div>
    </div>
  );
}
