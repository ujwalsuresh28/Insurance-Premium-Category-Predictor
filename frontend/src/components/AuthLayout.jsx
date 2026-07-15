import { Link } from "react-router-dom";
import { ShieldIcon, SparklesIcon } from "./Icons";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-layout">
      <aside className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="brand-mark">
            <ShieldIcon size={28} />
          </div>
          <h1>insureIQ</h1>
          <p className="auth-tagline">
            ML-powered insurance premium predictions, tailored to your health and lifestyle profile.
          </p>
          <ul className="auth-features">
            <li>
              <SparklesIcon size={16} />
              Instant category predictions
            </li>
            <li>
              <SparklesIcon size={16} />
              Secure JWT authentication
            </li>
            <li>
              <SparklesIcon size={16} />
              Full prediction history in MongoDB
            </li>
          </ul>
        </div>
        <div className="auth-brand-glow" />
      </aside>

      <main className="auth-form-panel">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h2>{title}</h2>
            <p className="muted">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

export function AuthFooterLink({ text, linkText, to }) {
  return (
    <p className="auth-footer">
      {text}{" "}
      <Link to={to} className="text-link">
        {linkText}
      </Link>
    </p>
  );
}
