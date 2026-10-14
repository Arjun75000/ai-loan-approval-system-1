import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";

export const LoanHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPrediction, setFilterPrediction] = useState("");
  const [filterRisk, setFilterRisk] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 10 };
      if (filterPrediction) params.prediction = filterPrediction;
      if (filterRisk) params.risk_category = filterRisk;

      const res = await api.getHistory(params);
      if (res && res.data) {
        setRecords(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, filterPrediction, filterRisk]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this historical analysis?")) {
      return;
    }

    try {
      await api.deleteLoan(id);
      setRecords(records.filter((r) => r._id !== id));
      if (selectedRecord && selectedRecord._id === id) {
        setSelectedRecord(null);
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Loan Analysis History</h2>
        <p>Comprehensive audit record of historical applicant assessments saved in database</p>
      </div>

      <DisclaimerBanner />

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Filter Records</div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <select
              className="form-control"
              style={{ padding: "6px 12px", fontSize: "13px" }}
              value={filterPrediction}
              onChange={(e) => {
                setFilterPrediction(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Decisions</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              className="form-control"
              style={{ padding: "6px 12px", fontSize: "13px" }}
              value={filterRisk}
              onChange={(e) => {
                setFilterRisk(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Risk Categories</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Medium Risk">Medium Risk</option>
              <option value="High Risk">High Risk</option>
              <option value="Very High Risk">Very High Risk</option>
            </select>
          </div>
        </div>

        {loading && <LoadingSpinner message="Querying history records..." />}

        {!loading && records.length === 0 && (
          <EmptyState
            title="No records match current filter"
            message="No historical evaluations match the selected criteria, or no analyses have been saved yet."
            actionText="Run New Analysis"
            onAction={() => window.location.href = "/analyzer"}
            icon="📁"
          />
        )}

        {!loading && records.length > 0 && (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Scenario</th>
                  <th>Amount</th>
                  <th>Income</th>
                  <th>Credit Score</th>
                  <th>Decision</th>
                  <th>Risk Level</th>
                  <th>Probability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td style={{ fontWeight: "500" }}>{r.scenario_name || "Default"}</td>
                    <td>${Number(r.inputs?.Loan_Amount || 0).toLocaleString()}</td>
                    <td>${Number(r.inputs?.Monthly_Income || 0).toLocaleString()}</td>
                    <td>{r.inputs?.Credit_Score}</td>
                    <td>
                      <StatusBadge type={r.prediction?.label} />
                    </td>
                    <td>
                      <StatusBadge type={r.prediction?.risk_category} />
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>
                      {r.prediction?.approval_probability !== undefined
                        ? `${(r.prediction.approval_probability * 100).toFixed(1)}%`
                        : "N/A"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedRecord(r)}
                        >
                          View
                        </button>
                        <a
                          href={api.getReportDownloadUrl(r._id, "json")}
                          className="btn btn-secondary btn-sm"
                          download
                          title="Download JSON"
                        >
                          JSON
                        </a>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(r._id)}
                          title="Delete record"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total records)
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedRecord && (
        <div className="card" style={{ marginTop: "24px", border: "2px solid var(--accent-primary)" }}>
          <div className="card-header">
            <div>
              <div className="card-title">Record Details: {selectedRecord.scenario_name || "Application"}</div>
              <div className="card-subtitle">ID: {selectedRecord._id} | Date: {new Date(selectedRecord.created_at).toLocaleString()}</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedRecord(null)}>
              Close
            </button>
          </div>

          <div className="grid-cols-2" style={{ marginBottom: "20px" }}>
            <div>
              <h4 style={{ fontSize: "14px", marginBottom: "10px" }}>Applicant Inputs</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
                <div>Age: <strong>{selectedRecord.inputs.Age}</strong></div>
                <div>Income: <strong>${selectedRecord.inputs.Monthly_Income?.toLocaleString()}</strong></div>
                <div>Credit Score: <strong>{selectedRecord.inputs.Credit_Score}</strong></div>
                <div>Employment: <strong>{selectedRecord.inputs.Employment_Years} yrs</strong></div>
                <div>Loan Amount: <strong>${selectedRecord.inputs.Loan_Amount?.toLocaleString()}</strong></div>
                <div>Tenure: <strong>{selectedRecord.inputs.Loan_Tenure_Months} mos</strong></div>
                <div>Existing Loans: <strong>{selectedRecord.inputs.Existing_Loans}</strong></div>
                <div>Existing EMI: <strong>${selectedRecord.inputs.Existing_EMI?.toLocaleString()}</strong></div>
                <div>Expenses: <strong>${selectedRecord.inputs.Monthly_Expenses?.toLocaleString()}</strong></div>
                <div>Past Defaults: <strong>{selectedRecord.inputs.Previous_Defaults}</strong></div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "14px", marginBottom: "10px" }}>Decision Intelligence</h4>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <StatusBadge type={selectedRecord.prediction?.label} />
                <StatusBadge type={selectedRecord.prediction?.risk_category} />
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, background: "var(--bg-tertiary)", padding: "12px", borderRadius: "8px" }}>
                {selectedRecord.prediction?.explanation}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <a
              href={api.getReportDownloadUrl(selectedRecord._id, "json")}
              className="btn btn-primary btn-sm"
              download
            >
              Export JSON Report
            </a>
            <a
              href={api.getReportDownloadUrl(selectedRecord._id, "csv")}
              className="btn btn-secondary btn-sm"
              download
            >
              Export CSV Report
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
