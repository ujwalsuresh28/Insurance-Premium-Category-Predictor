const CATEGORY_STYLES = {
  low: "badge-low",
  medium: "badge-medium",
  high: "badge-high",
};

export default function CategoryBadge({ category, large = false }) {
  const key = String(category).toLowerCase();
  const styleClass = CATEGORY_STYLES[key] || "badge-default";

  return (
    <span className={`category-badge ${styleClass} ${large ? "category-badge-lg" : ""}`}>
      {category}
    </span>
  );
}
