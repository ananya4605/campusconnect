import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(key) {
    return (e) => setForm({ ...form, [key]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Could not create account"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">Create your account</h1>
        <p className="muted">Join CampusConnect to share internships, events and study material.</p>

        {error && <div className="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Full name</span>
            <input required maxLength={60} value={form.name} onChange={update("name")} />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@college.edu"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={update("password")}
              placeholder="At least 6 characters"
            />
          </label>

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="auth-alt">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
