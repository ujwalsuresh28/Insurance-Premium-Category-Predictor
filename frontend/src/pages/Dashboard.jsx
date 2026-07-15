import { useState, useEffect } from "react";
import { api } from "../api/client";

const OCCUPATIONS = [
  { id: "private_job", label: "Private Job", icon: "💼" },
  { id: "government_job", label: "Govt Job", icon: "🏛️" },
  { id: "business_owner", label: "Business", icon: "🚀" },
  { id: "freelancer", label: "Freelancer", icon: "💻" },
  { id: "student", label: "Student", icon: "🎓" },
  { id: "retired", label: "Retired", icon: "👴" },
  { id: "unemployed", label: "Unemployed", icon: "⏱️" },
];

const SUGGESTED_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", 
  "Jaipur", "Chandigarh", "Indore", "Lucknow", "Patna", "Ranchi", "Surat", 
  "Ahmedabad", "Noida", "Gurgaon", "Coimbatore", "Bhopal", "Nagpur"
];

const T1_CITIES = ["mumbai", "delhi", "bangalore", "chennai", "kolkata", "hyderabad", "pune"];
const T2_CITIES = [
  "jaipur", "chandigarh", "indore", "lucknow", "patna", "ranchi", "visakhapatnam", 
  "coimbatore", "bhopal", "nagpur", "vadodara", "surat", "rajkot", "jodhpur", 
  "raipur", "amritsar", "varanasi", "agra", "dehradun", "mysore", "jabalpur", 
  "guwahati", "thiruvananthapuram", "ludhiana", "nashik", "allahabad", "udaipur", 
  "aurangabad", "hubli", "belgaum", "salem", "vijayawada", "tiruchirappalli", 
  "bhavnagar", "gwalior", "dhanbad", "bareilly", "aligarh", "gaya", "kozhikode", 
  "warangal", "kolhapur", "bilaspur", "jalandhar", "noida", "guntur", "asansol", "siliguri"
];

const initialForm = {
  age: 30,
  weight: 65,
  height: 1.7,
  income_lpa: 10,
  smoker: false,
  city: "Mumbai",
  occupation: "private_job",
};

export default function Dashboard() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanningStatus, setScanningStatus] = useState("");

  // Check if a saved prediction exists in localStorage to load (from History)
  useEffect(() => {
    const saved = localStorage.getItem("selected_prediction");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm({
          age: parsed.input.age || 30,
          weight: parsed.input.weight || 65,
          height: parsed.input.height || 1.70,
          income_lpa: parsed.input.income_lpa || 10,
          smoker: parsed.input.smoker === true,
          city: parsed.input.city || "Mumbai",
          occupation: parsed.input.occupation || "private_job",
        });
        setResult(parsed.output);
      } catch (err) {
        console.error("Failed to load saved prediction", err);
      } finally {
        localStorage.removeItem("selected_prediction");
      }
    }
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Real-time Derived Values
  const weightVal = Number(form.weight) || 65;
  const heightVal = Number(form.height) || 1.70;
  const rawBmi = weightVal / (heightVal * heightVal);
  const bmi = isNaN(rawBmi) || !isFinite(rawBmi) ? 0 : Number(rawBmi.toFixed(2));

  let bmiCategory = "Normal";
  let bmiPercent = 35; // default center-ish representer
  if (bmi < 18.5) {
    bmiCategory = "Underweight";
    bmiPercent = Math.max(5, (bmi / 18.5) * 25);
  } else if (bmi >= 18.5 && bmi < 25) {
    bmiCategory = "Normal";
    bmiPercent = 25 + ((bmi - 18.5) / 6.5) * 25;
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = "Overweight";
    bmiPercent = 50 + ((bmi - 25) / 5) * 25;
  } else if (bmi >= 30) {
    bmiCategory = "Obese";
    bmiPercent = Math.min(95, 75 + ((bmi - 30) / 15) * 25);
  }

  const isSmoker = form.smoker === true;
  let lifestyleRisk = "low";
  if (isSmoker && bmi > 30) lifestyleRisk = "high";
  else if (isSmoker && bmi > 27) lifestyleRisk = "medium";

  const cityLower = String(form.city).trim().toLowerCase();
  let cityTier = 3;
  if (T1_CITIES.includes(cityLower)) cityTier = 1;
  else if (T2_CITIES.includes(cityLower)) cityTier = 2;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    const statuses = [
      "Hashing user profile...",
      "Analyzing body mass index...",
      "Evaluating lifestyle risk factors...",
      "Connecting to prediction engine...",
      "Running Random Forest Classifier..."
    ];

    let statusIndex = 0;
    setScanningStatus(statuses[0]);
    const statusInterval = setInterval(() => {
      statusIndex++;
      if (statusIndex < statuses.length) {
        setScanningStatus(statuses[statusIndex]);
      }
    }, 600);

    try {
      const payload = {
        ...form,
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
        income_lpa: Number(form.income_lpa),
        smoker: form.smoker === true,
      };

      const response = await api.predict(payload);
      
      // Hold loader for a bit to display simulated engine checks
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      clearInterval(statusInterval);
      setResult(response);
    } catch (err) {
      clearInterval(statusInterval);
      setError(err.message);
    } finally {
      setLoading(false);
      setScanningStatus("");
    }
  }

  return (
    <div className="page">
      <section className="hero">
        <h1>Predict Your Premium Category</h1>
        <p className="muted">
          Input your health, location, and lifestyle parameters to analyze your ML-driven premium profile.
        </p>
      </section>

      <div className="grid-two">
        <form className="card" onSubmit={handleSubmit}>
          <h2>Your Health & Profile Details</h2>

          <div className="form-grid">
            {/* Age Slider */}
            <div className="range-slider-container full-width">
              <label>
                <div className="label-header">
                  <span>Age</span>
                  <span className="label-val">{form.age} years</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="100"
                  value={form.age}
                  onChange={(e) => updateField("age", Number(e.target.value))}
                  required
                />
              </label>
            </div>

            {/* Weight Slider */}
            <div className="range-slider-container">
              <label>
                <div className="label-header">
                  <span>Weight</span>
                  <span className="label-val">{form.weight} kg</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="150"
                  step="1"
                  value={form.weight}
                  onChange={(e) => updateField("weight", Number(e.target.value))}
                  required
                />
              </label>
            </div>

            {/* Height Slider */}
            <div className="range-slider-container">
              <label>
                <div className="label-header">
                  <span>Height</span>
                  <span className="label-val">{form.height.toFixed(2)} m</span>
                </div>
                <input
                  type="range"
                  min="1.00"
                  max="2.20"
                  step="0.01"
                  value={form.height}
                  onChange={(e) => updateField("height", Number(e.target.value))}
                  required
                />
              </label>
            </div>

            {/* Live BMI & Risk Meter */}
            <div className="live-meter-card">
              <div className="live-bmi-panel">
                <span className="switch-label-text">
                  Live BMI: <strong>{bmi}</strong> ({bmiCategory})
                </span>
                <div className="bmi-bar-outer">
                  <div className="bmi-bar-segment-colors" />
                  <div 
                    className="bmi-indicator-pin" 
                    style={{ left: `${bmiPercent}%` }}
                  />
                </div>
                <div className="bmi-ranges">
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                </div>
              </div>
              <div className="live-risk-panel">
                <span className="switch-label-text" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Health Risk Factor
                </span>
                <span className={`live-risk-badge ${lifestyleRisk}`}>
                  {lifestyleRisk} risk
                </span>
              </div>
            </div>

            {/* Income Slider */}
            <div className="range-slider-container full-width">
              <label>
                <div className="label-header">
                  <span>Annual Income</span>
                  <span className="label-val">{form.income_lpa} LPA</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="0.5"
                  value={form.income_lpa}
                  onChange={(e) => updateField("income_lpa", Number(e.target.value))}
                  required
                />
              </label>
            </div>

            {/* Smoker Toggle */}
            <div className="switch-wrapper">
              <span className="switch-label-text">Are you a smoker?</span>
              <label className="switch" style={{ flexDirection: "row", gap: 0 }}>
                <input
                  type="checkbox"
                  checked={form.smoker}
                  onChange={(e) => updateField("smoker", e.target.checked)}
                />
                <span className="slider" />
              </label>
            </div>

            {/* City with Suggestion */}
            <div className="city-input-wrapper">
              <label>
                City
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  list="city-suggestions"
                  placeholder="Type city..."
                  required
                />
                <span className={`city-tier-badge tier-${cityTier}`}>
                  Tier {cityTier}
                </span>
              </label>
              <datalist id="city-suggestions">
                {SUGGESTED_CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* Occupation Grid Pill Cards */}
            <div className="full-width" style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <label>Occupation</label>
              <div className="occupation-grid">
                {OCCUPATIONS.map((occ) => (
                  <div
                    key={occ.id}
                    className={`occupation-card ${form.occupation === occ.id ? "active" : ""}`}
                    onClick={() => updateField("occupation", occ.id)}
                  >
                    <span className="occupation-icon">{occ.icon}</span>
                    <span className="occupation-name">{occ.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Analyzing Parameters..." : "Predict Insurance Category"}
          </button>
        </form>

        <div className="card result-card">
          <h2>ML Model Prediction</h2>
          {error && <div className="alert error">{error}</div>}

          {/* Simulated scanning loading screen */}
          {loading && (
            <div className="scanner-container">
              <div className="scanner-box">
                <div className="scanner-dot-grid" />
              </div>
              <div className="scanner-status-text">{scanningStatus}</div>
            </div>
          )}

          {!loading && !result && !error && (
            <div className="result-placeholder">
              <div className="result-placeholder-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Ready to Analyze</h3>
              <p className="muted" style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                Complete the profile form and click Predict to estimate your risk and premium category.
              </p>
            </div>
          )}

          {/* Beautiful result view */}
          {!loading && result && (
            <div className="result-panel">
              <div className="risk-gauge-container">
                <div className={`risk-halo ${String(result.predicted_category).toLowerCase()}`} />
                <div className={`premium-badge-large ${String(result.predicted_category).toLowerCase()}`}>
                  <span className="badge-subtext">Premium Category</span>
                  <span className="category-text">{result.predicted_category}</span>
                </div>
              </div>

              <div className="result-title-section">
                <h3>Prediction Verified</h3>
                <p className="muted" style={{ fontSize: "0.85rem" }}>
                  Your details match a <strong>{result.predicted_category}</strong> premium rating profile.
                </p>
              </div>

              <div className="feature-list">
                <div>
                  <span>Calculated BMI</span>
                  <strong>{result.derived_features.bmi}</strong>
                </div>
                <div>
                  <span>Age Cohort</span>
                  <strong style={{ textTransform: "capitalize" }}>
                    {result.derived_features.age_group.replaceAll("_", " ")}
                  </strong>
                </div>
                <div>
                  <span>Lifestyle Profile</span>
                  <strong style={{ textTransform: "capitalize" }}>
                    {result.derived_features.lifestyle_risk} Risk
                  </strong>
                </div>
                <div>
                  <span>Urban Density</span>
                  <strong>Tier {result.derived_features.city_tier} City</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
