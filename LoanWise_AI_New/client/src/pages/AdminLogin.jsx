import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Administrator email and master password are required.");
      return;
    }

    try {
      setLoading(true);
      await adminLogin(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Admin authorization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "440px", margin: "40px auto" }}>
      <div className="card" style={{ borderTop: "4px solid #4f46e5" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              margin: "0 auto 12px auto",
              width: "52px",
              height: "52px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #312e81, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "24px"
            }}
          >
            🛡️
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)" }}>Administrator Portal</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Restricted system governance & model management</p>
        </div>

        <div style={{ background: "rgba(79, 70, 229, 0.08)", border: "1px solid rgba(79, 70, 229, 0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#4f46e5", marginBottom: "18px" }}>
          <strong>Notice:</strong> This console requires verified role-based administrator privileges. All login sessions are audited.
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label">Administrator Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@loanwise.ai"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "22px" }}>
            <label className="form-label">Master Password</label>
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
            style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #312e81, #4f46e5)" }}
            disabled={loading}
          >
            {loading ? "Verifying Authorization..." : "Access Administrator Console"}
          </button>
        </form>

        <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--border-color)", textAlign: "center", fontSize: "13px" }}>
          <Link to="/login" style={{ color: "var(--text-muted)" }}>
            ← Return to Standard User Login
          </Link>
        </div>
      </div>
    </div>
  );
};
