import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout, { AuthFooterLink } from "../components/AuthLayout";
import { ArrowRightIcon } from "../components/Icons";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your predictions and history."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="alert error">{error}</div>}

        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary btn-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
          {!loading && <ArrowRightIcon />}
        </button>

        <AuthFooterLink text="Don't have an account?" linkText="Create one" to="/register" />
      </form>
    </AuthLayout>
  );
}
