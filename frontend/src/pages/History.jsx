import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import CategoryBadge from "../components/CategoryBadge";

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("all"); // "all", "low", "medium", "high"
  const [smokerFilter, setSmokerFilter] = useState("all"); // "all", "smoker", "non-smoker"
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api
      .history()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleLoadIntoForm(item) {
    localStorage.setItem("selected_prediction", JSON.stringify(item));
    navigate("/");
  }

  // Filter logic
  const filteredItems = items.filter((item) => {
    const categoryMatch =
      categoryFilter === "all" ||
      item.output.predicted_category.toLowerCase() === categoryFilter;

    const isSmoker = item.input.smoker === true;
    const smokerMatch =
      smokerFilter === "all" ||
      (smokerFilter === "smoker" && isSmoker) ||
      (smokerFilter === "non-smoker" && !isSmoker);

    const query = searchQuery.toLowerCase().trim();
    const searchMatch =
      !query ||
      item.input.city.toLowerCase().includes(query) ||
      item.input.occupation.toLowerCase().includes(query);

    return categoryMatch && smokerMatch && searchMatch;
  });

  return (
    <div className="page">
      <section className="hero">
        <h1>Prediction History</h1>
        <p className="muted">
          Your saved premium estimations, logged and analyzed by the ML engine.
        </p>
      </section>

      {error && <div className="alert error">{error}</div>}

      {/* Filter and Search Bar */}
      {!loading && !error && (
        <div className="filter-bar">
          <div className="filter-group">
            <span className="filter-label">Filter Category</span>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                className={`btn-filter-pill ${categoryFilter === "all" ? "active" : ""}`}
                onClick={() => setCategoryFilter("all")}
              >
                All
              </button>
              <button
                className={`btn-filter-pill ${categoryFilter === "low" ? "active low" : ""}`}
                onClick={() => setCategoryFilter("low")}
              >
                Low
              </button>
              <button
                className={`btn-filter-pill ${categoryFilter === "medium" ? "active medium" : ""}`}
                onClick={() => setCategoryFilter("medium")}
              >
                Medium
              </button>
              <button
                className={`btn-filter-pill ${categoryFilter === "high" ? "active high" : ""}`}
                onClick={() => setCategoryFilter("high")}
              >
                High
              </button>
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Smoker Status</span>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                className={`btn-filter-pill ${smokerFilter === "all" ? "active" : ""}`}
                onClick={() => setSmokerFilter("all")}
              >
                All
              </button>
              <button
                className={`btn-filter-pill ${smokerFilter === "smoker" ? "active" : ""}`}
                onClick={() => setSmokerFilter("smoker")}
              >
                Smoker
              </button>
              <button
                className={`btn-filter-pill ${smokerFilter === "non-smoker" ? "active" : ""}`}
                onClick={() => setSmokerFilter("non-smoker")}
              >
                Non-Smoker
              </button>
            </div>
          </div>

          <div className="search-input-wrapper">
            <span className="search-icon-inside">🔍</span>
            <input
              type="text"
              placeholder="Search by city or occupation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div className="spinner" style={{ margin: "0 auto 1.5rem" }} />
          <span>Retrieving history logs...</span>
        </div>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <div className="card empty-state">
          <div className="result-placeholder-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <h3>No predictions found</h3>
          <p className="muted">
            {items.length === 0
              ? "You haven't run any premium estimations yet."
              : "Adjust your filters or query to find predictions."}
          </p>
        </div>
      )}

      <div className="history-list">
        {filteredItems.map((item) => {
          const categoryClass = String(item.output.predicted_category).toLowerCase();
          return (
            <article className={`card history-item ${categoryClass}`} key={item.id}>
              <div className="history-header">
                <CategoryBadge category={item.output.predicted_category} />
                <time>{formatDate(item.created_at)}</time>
              </div>

              <div className="history-grid">
                <div>
                  <h3>Input parameters</h3>
                  <ul>
                    <li>
                      <span>Age</span>
                      <strong>{item.input.age} yrs</strong>
                    </li>
                    <li>
                      <span>Weight & Height</span>
                      <strong>
                        {item.input.weight} kg / {item.input.height} m
                      </strong>
                    </li>
                    <li>
                      <span>Annual income</span>
                      <strong>{item.input.income_lpa} LPA</strong>
                    </li>
                    <li>
                      <span>Smoking status</span>
                      <strong>{item.input.smoker ? "Smoker" : "Non-smoker"}</strong>
                    </li>
                    <li>
                      <span>Location</span>
                      <strong>{item.input.city}</strong>
                    </li>
                    <li>
                      <span>Occupation</span>
                      <strong style={{ textTransform: "capitalize" }}>
                        {item.input.occupation.replaceAll("_", " ")}
                      </strong>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3>Derived features</h3>
                  <ul>
                    <li>
                      <span>Body Mass Index (BMI)</span>
                      <strong>{item.output.derived_features.bmi}</strong>
                    </li>
                    <li>
                      <span>Age bracket</span>
                      <strong style={{ textTransform: "capitalize" }}>
                        {item.output.derived_features.age_group.replaceAll("_", " ")}
                      </strong>
                    </li>
                    <li>
                      <span>Lifestyle health risk</span>
                      <strong style={{ textTransform: "capitalize" }}>
                        {item.output.derived_features.lifestyle_risk} Risk
                      </strong>
                    </li>
                    <li>
                      <span>City density tier</span>
                      <strong>Tier {item.output.derived_features.city_tier}</strong>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="history-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleLoadIntoForm(item)}
                >
                  <span>🔄</span> Load into Form
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
