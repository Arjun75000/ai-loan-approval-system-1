import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { MetricCard } from "../components/MetricCard";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [mlStatus, setMlStatus] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [metricsRes, statusRes, historyRes] = await Promise.allSettled([
          api.getMlMetrics(),
          api.getMlStatus(),
          api.getHistory({ limit: 5 })
        ]);

        if (metricsRes.status === "fulfilled" && metricsRes.value.success) {
          setMetrics(metricsRes.value.metrics);
        }

        if (statusRes.status === "fulfilled" && statusRes.value.success) {
          setMlStatus(statusRes.value);
        }

        if (historyRes.status === "fulfilled" && historyRes.value.success) {
          setRecentLoans(historyRes.value.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading loan intelligence dashboard..." />;
  }

  const testMetrics = metrics?.test_metrics;
  const baseline = metrics?.baseline_comparison;
  const datasetRows = metrics?.dataset_size || mlStatus?.dataset?.validation?.total_rows || 2000;

  return (
    <div>
      <div className="page-header">
        <h2>Smart Loan Approval & Credit Risk Intelligence</h2>
        <p>Real-time machine learning decision-support, risk profiling, and affordability modeling</p>
      </div>

      <DisclaimerBanner />

      {error && <div className="error-banner">{error}</div>}

      <div className="grid-cols-4">
        <MetricCard
          label="Model Type"
          value="Decision Tree"
          subtext="Scikit-Learn Classifier"
          icon="🌲"
          highlightColor="#2563eb"
        />
        <MetricCard
          label="Model Test Accuracy"
          value={testMetrics ? `${(testMetrics.accuracy * 100).toFixed(1)}%` : "N/A"}
          subtext={baseline ? `Baseline: ${(baseline.baseline_accuracy * 100).toFixed(1)}%` : "Stratified Holdout"}
          icon="🎯"
          highlightColor="#10b981"
        />
        <MetricCard
          label="ROC-AUC Score"
          value={testMetrics?.roc_auc ? testMetrics.roc_auc.toFixed(3) : "N/A"}
          subtext="Discrimination capacity"
          icon="📈"
          highlightColor="#8b5cf6"
        />
        <MetricCard
          label="Dataset Records"
          value={datasetRows.toLocaleString()}
          subtext="10 features + binary label"
          icon="🗄️"
          highlightColor="#f59e0b"
        />
      </div>

      <div className="grid-cols-3" style={{ marginTop: "24px" }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Eligibility Analyzer</div>
              <div className="card-subtitle">Evaluate applicant risk profile</div>
            </div>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
            Input comprehensive financial details to generate an instantaneous Decision Tree evaluation, confidence rating, and risk breakdown.
          </p>
          <Link to="/analyzer" className="btn btn-primary" style={{ width: "100%" }}>
            Launch Analyzer
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Affordability Calculator</div>
              <div className="card-subtitle">Reducing-balance EMI formulas</div>
            </div>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
            Model monthly debt obligations, total accrued interest, and debt-to-income (DTI) metrics across configurable terms and rates.
          </p>
          <Link to="/affordability" className="btn btn-secondary" style={{ width: "100%" }}>
            Calculate Affordability
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">What-If Scenario Lab</div>
              <div className="card-subtitle">Multi-parameter experimentation</div>
            </div>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
            Simulate alternative tenures, modified loan sums, and altered down payments side-by-side to uncover risk-mitigating terms.
          </p>
          <Link to="/scenarios" className="btn btn-secondary" style={{ width: "100%" }}>
            Open Scenario Lab
          </Link>
        </div>
      </div>

      <div className="card" style={{ marginTop: "24px" }}>
        <div className="card-header">
          <div>
            <div className="card-title">Recent Loan Analyses</div>
            <div className="card-subtitle">Latest applicant evaluations recorded in database</div>
          </div>
          <Link to="/history" className="btn btn-secondary btn-sm">
            View All History
          </Link>
        </div>

        {recentLoans.length === 0 ? (
          <EmptyState
            title="No analyses logged yet"
            message="Run your first applicant assessment in the Eligibility Analyzer to view real historical predictions here."
            actionText="Analyze First Applicant"
            onAction={() => window.location.href = "/analyzer"}
            icon="📋"
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Requested Amount</th>
                  <th>Income</th>
                  <th>Credit Score</th>
                  <th>Prediction</th>
                  <th>Risk Rating</th>
                  <th>Probability</th>
                </tr>
              </thead>
              <tbody>
                {recentLoans.map((loan) => (
                  <tr key={loan._id}>
                    <td>{new Date(loan.created_at).toLocaleString()}</td>
                    <td>${Number(loan.inputs.Loan_Amount).toLocaleString()}</td>
                    <td>${Number(loan.inputs.Monthly_Income).toLocaleString()}</td>
                    <td>{loan.inputs.Credit_Score}</td>
                    <td>
                      <StatusBadge type={loan.prediction.label} />
                    </td>
                    <td>
                      <StatusBadge type={loan.prediction.risk_category} />
                    </td>
                    <td>
                      {loan.prediction.approval_probability !== undefined
                        ? `${(loan.prediction.approval_probability * 100).toFixed(1)}%`
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
