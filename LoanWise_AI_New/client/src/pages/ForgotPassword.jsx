import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Please provide your email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.forgotPassword(email);
      if (res && res.resetToken) {
        setToken(res.resetToken);
        setStep(2);
        setMessage("A reset token has been generated. Enter your new password below.");
      } else {
        setMessage(res.message || "Password reset instructions sent.");
        setStep(2);
      }
    } catch (err) {
      setError(err.message || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token || !newPassword) {
      setError("Token and new password are required.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.resetPassword(token, newPassword);
      setMessage(res.message || "Password reset successfully. You can now sign in.");
      setStep(3);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "460px", margin: "40px auto" }}>
      <div className="card">
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div className="logo-badge" style={{ margin: "0 auto 12px auto", width: "48px", height: "48px", fontSize: "20px" }}>🔑</div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)" }}>Reset Your Password</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            {step === 1 && "Enter your registered email to begin recovery"}
            {step === 2 && "Configure your new secure credentials"}
            {step === 3 && "Recovery process complete"}
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {message && <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-border)", color: "var(--success)", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>{message}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestToken}>
            <div className="form-group" style={{ marginBottom: "20px" }}>
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

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px" }}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Generate Reset Token"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">Reset Token</label>
              <input
                type="text"
                className="form-control"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token or use auto-filled"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px" }}
              disabled={loading}
            >
              {loading ? "Updating..." : "Save New Password"}
            </button>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <Link to="/login" className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
              Proceed to Sign In
            </Link>
          </div>
        )}

        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-color)", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
          Remembered your credentials?{" "}
          <Link to="/login" style={{ color: "var(--accent-primary)", fontWeight: "600" }}>
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
