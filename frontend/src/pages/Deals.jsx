import { useEffect, useState } from "react";
import { Flame, Tag } from "lucide-react";
import DealCard from "../components/deals/DealCard.jsx";
import { getDeals } from "../services/dealApi.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDeals();
        setDeals(res.data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleClaimed = (dealId) => {
    setDeals((prev) => prev.filter((d) => d._id !== dealId));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="section">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="section-title">Today&apos;s Deals</h1>
            <p className="section-subtitle">Limited-time offers you don&apos;t want to miss</p>
          </div>
          <div className="flex items-center gap-2 text-orange-500">
            <Flame size={20} />
            <span className="font-semibold text-sm">{deals.length} Active Deals</span>
          </div>
        </div>

        {deals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Tag size={36} />
            </div>
            <h3 className="empty-state-title">No active deals right now</h3>
            <p className="empty-state-description">Check back later for amazing discounts and offers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {deals.map((deal) => (
              <DealCard key={deal._id} deal={deal} onClaimed={handleClaimed} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
