import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import { EmptyState } from "../components/EmptyState";

export const UserDashboard = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [profileName, setProfileName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileErr, setProfileErr] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const res = await api.getUserStats();
      if (res && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      setError(err.message || "Failed to load personal dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserStats();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileErr(null);

    try {
      setSavingProfile(true);
      const payload = { name: profileName };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const res = await api.updateProfile(payload);
      if (res && res.user) {
        updateUser(res.user);
        setProfileMsg("Profile updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err) {
      setProfileErr(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving your personal credit intelligence dashboard..." />;
  }

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2>Welcome back, {user?.name || "Applicant"}</h2>
          <p>Personal loan analytics, history tracking, and financial modeling profile</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link to="/analyzer" className="btn btn-primary btn-sm">
            + Run New Assessment
          </Link>
          <Link to="/scenarios" className="btn btn-secondary btn-sm">
            What-If Scenario Lab
          </Link>
        </div>
      </div>

      <DisclaimerBanner />

      {error && <div className="error-banner">{error}</div>}

      <div className="grid-cols-4">
        <MetricCard
          label="Total Saved Analyses"
          value={stats?.totalAnalyses || 0}
          subtext="Evaluations recorded"
          icon="📊"
          highlightColor="#2563eb"
        />
        <MetricCard
          label="Approved Predictions"
          value={stats?.approvedCount || 0}
          subtext="Viable credit profiles"
          icon="✅"
          highlightColor="#10b981"
        />
        <MetricCard
          label="High-Risk / Rejected"
          value={stats?.rejectedCount || 0}
          subtext="Profiles needing adjustments"
          icon="⚠️"
          highlightColor="#ef4444"
        />
        <MetricCard
          label="Approval Ratio"
          value={`${stats?.approvalRate || 0}%`}
          subtext="Historical favorable rate"
          icon="🎯"
          highlightColor="#8b5cf6"
        />
      </div>

      <div className="grid-cols-3" style={{ marginTop: "24px" }}>
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-header">
            <div>
              <div className="card-title">Your Recent Loan Evaluations</div>
              <div className="card-subtitle">Personal predictive credit audit trails</div>
            </div>
            <Link to="/history" className="btn btn-secondary btn-sm">
              View All History
            </Link>
          </div>

          {(!stats?.recentAnalyses || stats.recentAnalyses.length === 0) ? (
            <EmptyState
              title="No personal predictions recorded"
              message="Run your first assessment in the Eligibility Analyzer to view your historical credit evaluations here."
              actionText="Start Assessment"
              onAction={() => window.location.href = "/analyzer"}
              icon="📋"
            />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Requested Loan</th>
                    <th>Income</th>
                    <th>Credit Score</th>
                    <th>Decision</th>
                    <th>Risk Stratum</th>
                    <th>Probability</th>
                    <th>Export</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAnalyses.map((record) => (
                    <tr key={record._id}>
                      <td>{new Date(record.created_at).toLocaleDateString()}</td>
                      <td>${Number(record.inputs?.Loan_Amount || 0).toLocaleString()}</td>
                      <td>${Number(record.inputs?.Monthly_Income || 0).toLocaleString()}</td>
                      <td>{record.inputs?.Credit_Score}</td>
                      <td>
                        <StatusBadge type={record.prediction?.label} />
                      </td>
                      <td>
                        <StatusBadge type={record.prediction?.risk_category} />
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>
                        {record.prediction?.approval_probability !== undefined
                          ? `${(record.prediction.approval_probability * 100).toFixed(1)}%`
                          : "N/A"}
                      </td>
                      <td>
                        <a
                          href={api.getReportDownloadUrl(record._id, "json")}
                          className="btn btn-secondary btn-sm"
                          download
                        >
                          JSON
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Profile Settings</div>
            <span className="badge badge-low-risk">Active User</span>
          </div>

          {profileMsg && <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-border)", color: "var(--success)", padding: "10px", borderRadius: "6px", fontSize: "12px", marginBottom: "14px" }}>{profileMsg}</div>}
          {profileErr && <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", color: "var(--danger)", padding: "10px", borderRadius: "6px", fontSize: "12px", marginBottom: "14px" }}>{profileErr}</div>}

          <form onSubmit={handleProfileUpdate}>
            <div className="form-group" style={{ marginBottom: "12px" }}>
              <label className="form-label" style={{ fontSize: "12px" }}>Account Name</label>
              <input
                type="text"
                className="form-control"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "12px" }}>
              <label className="form-label" style={{ fontSize: "12px" }}>Email (Registered)</label>
              <input
                type="text"
                className="form-control"
                value={user?.email || ""}
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>

            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "8px", color: "var(--text-secondary)" }}>Change Password (Optional)</div>
              
              <div className="form-group" style={{ marginBottom: "10px" }}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="New Password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ width: "100%" }}
              disabled={savingProfile}
            >
              {savingProfile ? "Saving..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
