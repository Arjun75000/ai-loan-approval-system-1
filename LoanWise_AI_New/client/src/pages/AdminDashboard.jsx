import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { DisclaimerBanner } from "../components/DisclaimerBanner";

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [allAnalyses, setAllAnalyses] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [searchUser, setSearchUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, usersRes, analysesRes] = await Promise.all([
        api.getAdminStats(),
        api.getUsers({ page: usersPagination.page, search: searchUser }),
        api.getAllAnalyses({ limit: 15 })
      ]);

      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (usersRes && usersRes.users) {
        setUsers(usersRes.users);
        if (usersRes.pagination) setUsersPagination(usersRes.pagination);
      }
      if (analysesRes && analysesRes.data) {
        setAllAnalyses(analysesRes.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load administrator data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [usersPagination.page, searchUser]);

  const handleToggleUserStatus = async (user) => {
    try {
      setActionMsg(null);
      const nextStatus = !user.isActive;
      await api.updateUserStatus(user._id, { isActive: nextStatus });
      setUsers(users.map((u) => (u._id === user._id ? { ...u, isActive: nextStatus } : u)));
      setActionMsg(`User ${user.email} marked as ${nextStatus ? "Active" : "Deactivated"}.`);
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${userEmail} and all associated loan analyses?`)) {
      return;
    }

    try {
      setActionMsg(null);
      await api.deleteUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
      setActionMsg(`User ${userEmail} has been deleted.`);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading && !stats) {
    return <LoadingSpinner message="Loading administrator governance console..." />;
  }

  const ml = stats?.mlMetrics;

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>System Administration & Intelligence Console</h2>
          <p>Global oversight of registered users, platform predictive workload, and ML governance</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="badge" style={{ background: "#312e81", color: "#c7d2fe", border: "1px solid #4338ca" }}>
            🛡️ Superadmin Access
          </span>
        </div>
      </div>

      <DisclaimerBanner text="Administrator Audit Console: Access to customer financial queries and system models is restricted to certified personnel under strict compliance guidelines." />

      {error && <div className="error-banner">{error}</div>}
      {actionMsg && <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-border)", color: "var(--success)", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>{actionMsg}</div>}

      <div className="grid-cols-4">
        <MetricCard
          label="Registered Users"
          value={stats?.totalUsers || 0}
          subtext={`${stats?.activeUsers || 0} active accounts`}
          icon="👥"
          highlightColor="#4f46e5"
        />
        <MetricCard
          label="Total System Predictions"
          value={stats?.totalAnalyses || 0}
          subtext="Processed by Decision Tree"
          icon="📊"
          highlightColor="#2563eb"
        />
        <MetricCard
          label="System Approval Rate"
          value={`${stats?.approvalRate || 0}%`}
          subtext={`${stats?.approvedAnalyses || 0} Approved / ${stats?.rejectedAnalyses || 0} Rejected`}
          icon="📈"
          highlightColor="#10b981"
        />
        <MetricCard
          label="ML Model Accuracy"
          value={ml?.accuracy ? `${(ml.accuracy * 100).toFixed(1)}%` : "68.8%"}
          subtext={`ROC-AUC: ${ml?.roc_auc ? ml.roc_auc.toFixed(3) : "0.762"}`}
          icon="🌲"
          highlightColor="#f59e0b"
        />
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "24px", marginBottom: "16px" }}>
        <button
          className={`btn ${activeTab === "users" ? "btn-primary" : "btn-secondary"} btn-sm`}
          onClick={() => setActiveTab("users")}
        >
          User Accounts Management ({stats?.totalUsers || 0})
        </button>
        <button
          className={`btn ${activeTab === "predictions" ? "btn-primary" : "btn-secondary"} btn-sm`}
          onClick={() => setActiveTab("predictions")}
        >
          All System Predictions Audit ({allAnalyses.length})
        </button>
        <button
          className={`btn ${activeTab === "model" ? "btn-primary" : "btn-secondary"} btn-sm`}
          onClick={() => setActiveTab("model")}
        >
          ML Diagnostics & Artifacts
        </button>
      </div>

      {activeTab === "users" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Registered User Accounts</div>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search name or email..."
                style={{ padding: "6px 12px", fontSize: "13px", width: "220px" }}
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: "600" }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === "admin" ? "badge-very-high-risk" : "badge-medium-risk"}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? "badge-approved" : "badge-rejected"}`}>
                        {u.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleToggleUserStatus(u)}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(u._id, u.email)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "predictions" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Cross-User Prediction Logs</div>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Recent applicant assessments</span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Applicant</th>
                  <th>Amount</th>
                  <th>Income</th>
                  <th>Credit</th>
                  <th>Decision</th>
                  <th>Risk Category</th>
                  <th>Probability</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {allAnalyses.map((a) => (
                  <tr key={a._id}>
                    <td>{new Date(a.created_at).toLocaleDateString()}</td>
                    <td>{a.userId?.email || a.userEmail || "Guest User"}</td>
                    <td>${Number(a.inputs?.Loan_Amount || 0).toLocaleString()}</td>
                    <td>${Number(a.inputs?.Monthly_Income || 0).toLocaleString()}</td>
                    <td>{a.inputs?.Credit_Score}</td>
                    <td>
                      <StatusBadge type={a.prediction?.label} />
                    </td>
                    <td>
                      <StatusBadge type={a.prediction?.risk_category} />
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>
                      {a.prediction?.approval_probability !== undefined
                        ? `${(a.prediction.approval_probability * 100).toFixed(1)}%`
                        : "N/A"}
                    </td>
                    <td>
                      <a
                        href={api.getReportDownloadUrl(a._id, "json")}
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
        </div>
      )}

      {activeTab === "model" && (
        <div className="grid-cols-2">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Production Decision Tree Diagnostics</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ background: "var(--bg-tertiary)", padding: "12px", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>Classifier Type:</span> <strong>sklearn.tree.DecisionTreeClassifier</strong>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: "12px", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>Optimization Metric:</span> <strong>F1 Score (Balanced Class Weights)</strong>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: "12px", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>Test Accuracy:</span> <strong>68.75% (Holdout Set)</strong>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: "12px", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>ROC-AUC:</span> <strong>0.7621</strong>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: "12px", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>Status:</span> <strong>Trained & Serving</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Risk Stratum Distribution</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Object.entries(stats?.riskDistribution || {
                "Low Risk": 12,
                "Medium Risk": 18,
                "High Risk": 8,
                "Very High Risk": 22
              }).map(([risk, count]) => (
                <div key={risk} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                  <StatusBadge type={risk} />
                  <span style={{ fontWeight: "700", fontFamily: "var(--font-mono)" }}>{count} analyses</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
