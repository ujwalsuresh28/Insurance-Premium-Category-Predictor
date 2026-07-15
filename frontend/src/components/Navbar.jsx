import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChartIcon, HistoryIcon, LogOutIcon, ShieldIcon } from "./Icons";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <ShieldIcon size={18} />
          </span>
          insureIQ
        </Link>

        <nav className="nav-links">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            <ChartIcon size={16} />
            Predict
          </Link>
          <Link to="/history" className={location.pathname === "/history" ? "active" : ""}>
            <HistoryIcon size={16} />
            History
          </Link>
        </nav>

        <div className="nav-user">
          <div className="user-chip">
            <span className="avatar">{initials}</span>
            <div className="user-meta">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button type="button" className="btn-ghost" onClick={logout} aria-label="Logout">
            <LogOutIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
