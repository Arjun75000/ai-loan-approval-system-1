import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/user/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "440px", margin: "40px auto" }}>
      <div className="card">
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div className="logo-badge" style={{ margin: "0 auto 12px auto", width: "48px", height: "48px", fontSize: "20px" }}>LW</div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)" }}>Sign In to LoanWise AI</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Access your personal loan intelligence dashboard</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Password</label>
              <Link to="/forgot-password" style={{ fontSize: "12px", color: "var(--accent-primary)" }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-color)", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--accent-primary)", fontWeight: "600" }}>
            Create an Account
          </Link>
        </div>

        <div style={{ marginTop: "12px", textAlign: "center", fontSize: "12px" }}>
          <Link to="/admin/login" style={{ color: "var(--text-muted)" }}>
            Go to Administrator Portal →
          </Link>
        </div>
      </div>
    </div>
  );
};
