import { SearchX } from "lucide-react";

export default function EmptyState({ title = "No results found", description = "Try adjusting your search or filters." }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><SearchX size={36} /></div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
    </div>
  );
}
