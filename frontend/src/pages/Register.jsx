import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthLayout, { AuthFooterLink } from "../components/AuthLayout";
import { ArrowRightIcon } from "../components/Icons";

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start predicting premium categories in seconds."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="alert error">{error}</div>}

        <div className="field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        <button type="submit" className="btn-primary btn-full" disabled={loading}>
          {loading ? "Creating account..." : "Get started"}
          {!loading && <ArrowRightIcon />}
        </button>

        <AuthFooterLink text="Already have an account?" linkText="Sign in" to="/login" />
      </form>
    </AuthLayout>
  );
}
