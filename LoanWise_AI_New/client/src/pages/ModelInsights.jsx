import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import { MetricCard } from "../components/MetricCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, PieChart, Pie, Legend
} from "recharts";

export const ModelInsights = () => {
  const [metrics, setMetrics] = useState(null);
  const [featureImportance, setFeatureImportance] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const [metricsRes, fiRes, evalRes] = await Promise.allSettled([
          api.getMlMetrics(),
          api.getFeatureImportance(),
          api.getEvaluationReport()
        ]);

        if (metricsRes.status === "fulfilled" && metricsRes.value.success) {
          setMetrics(metricsRes.value.metrics);
        }
        if (fiRes.status === "fulfilled" && fiRes.value.success) {
          setFeatureImportance(fiRes.value.feature_importance);
        }
        if (evalRes.status === "fulfilled" && evalRes.value.success) {
          setEvaluation(evalRes.value.report);
        }
      } catch (err) {
        setError(err.message || "Failed to load model insights");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading ML model metrics and diagnostics..." />;
  }

  const testMetrics = metrics?.test_metrics;
  const baseline = metrics?.baseline_comparison;
  const cv = metrics?.cross_validation;
  const confMatrix = testMetrics?.confusion_matrix;

  const featureChartData = featureImportance?.sorted_features
    ? featureImportance.sorted_features.map((f) => ({
        name: f.feature.replace(/_/g, " "),
        importance: Number((f.importance * 100).toFixed(2))
      }))
    : [];

  const classDist = metrics?.class_distribution?.total
    ? [
        { name: "Rejected (Class 0)", value: metrics.class_distribution.total["0"] || 0, color: "#ef4444" },
        { name: "Approved (Class 1)", value: metrics.class_distribution.total["1"] || 0, color: "#10b981" }
      ]
    : [];

  return (
    <div>
      <div className="page-header">
        <h2>Explainable Credit Risk & ML Diagnostics</h2>
        <p>Comprehensive performance auditing of the scikit-learn DecisionTreeClassifier pipeline</p>
      </div>

      <DisclaimerBanner text="Model Explainability Notice: Feature importance measures how heavily each attribute contributes to node split criteria within the trained Decision Tree. It indicates statistical correlation within this specific training sample, not real-world causation." />

      {error && <div className="error-banner">{error}</div>}

      <div className="grid-cols-4">
        <MetricCard
          label="Test Accuracy"
          value={testMetrics ? `${(testMetrics.accuracy * 100).toFixed(1)}%` : "N/A"}
          subtext={`Baseline (Majority): ${(baseline?.baseline_accuracy * 100).toFixed(1)}%`}
          highlightColor="#2563eb"
        />
        <MetricCard
          label="Test F1-Score"
          value={testMetrics ? testMetrics.f1_score.toFixed(3) : "N/A"}
          subtext={`Precision: ${(testMetrics?.precision * 100).toFixed(1)}% | Recall: ${(testMetrics?.recall * 100).toFixed(1)}%`}
          highlightColor="#10b981"
        />
        <MetricCard
          label="Cross-Validation F1"
          value={cv ? `${(cv.mean_f1 * 100).toFixed(1)}%` : "N/A"}
          subtext={`5-Fold Stratified (±${(cv?.std_f1 * 100).toFixed(1)}%)`}
          highlightColor="#8b5cf6"
        />
        <MetricCard
          label="ROC-AUC Score"
          value={testMetrics?.roc_auc ? testMetrics.roc_auc.toFixed(3) : "N/A"}
          subtext="Discrimination between classes"
          highlightColor="#f59e0b"
        />
      </div>

      <div className="grid-cols-2" style={{ marginTop: "24px" }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Feature Importance Analysis</div>
              <div className="card-subtitle">Contribution to Gini/Entropy Impurity Reduction (%)</div>
            </div>
          </div>

          <div style={{ height: "340px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={featureChartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" unit="%" />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="importance" fill="#2563eb" radius={[0, 4, 4, 0]}>
                  {featureChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? "#2563eb" : "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Confusion Matrix & Error Breakdown</div>
              <div className="card-subtitle">Stratified Holdout Evaluation (20% of Dataset)</div>
            </div>
          </div>

          {confMatrix && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", textAlign: "center" }}>
                <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-border)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>True Negatives (Correct Rejections)</div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "var(--success)" }}>{confMatrix[0][0]}</div>
                </div>

                <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>False Positives (False Approvals)</div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "var(--danger)" }}>{confMatrix[0][1]}</div>
                </div>

                <div style={{ background: "var(--warning-bg)", border: "1px solid var(--warning-border)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>False Negatives (False Rejections)</div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "var(--warning)" }}>{confMatrix[1][0]}</div>
                </div>

                <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-border)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>True Positives (Correct Approvals)</div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "var(--success)" }}>{confMatrix[1][1]}</div>
                </div>
              </div>

              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, background: "var(--bg-tertiary)", padding: "14px", borderRadius: "8px" }}>
                <strong>Risk Trade-Off Analysis:</strong> In lending systems, False Approvals represent significant credit default risk, while False Rejections represent lost customer goodwill and opportunity cost. The Decision Tree parameters are tuned with class balancing to optimize the F1 trade-off rather than raw majority classification accuracy.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid-cols-2" style={{ marginTop: "24px" }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Class Distribution (Imbalance Audit)</div>
              <div className="card-subtitle">Total Dataset Label Proportions</div>
            </div>
          </div>

          <div style={{ height: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classDist}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {classDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} records`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Hyperparameters & Model Governance</div>
              <div className="card-subtitle">GridSearchCV Optimal Selection</div>
            </div>
          </div>

          {metrics?.best_parameters && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
              <div style={{ background: "var(--bg-tertiary)", padding: "10px", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Criterion:</span> <strong>{metrics.best_parameters.criterion}</strong>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: "10px", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Max Depth:</span> <strong>{metrics.best_parameters.max_depth}</strong>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: "10px", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Min Samples Split:</span> <strong>{metrics.best_parameters.min_samples_split}</strong>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: "10px", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Min Samples Leaf:</span> <strong>{metrics.best_parameters.min_samples_leaf}</strong>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: "10px", borderRadius: "6px", gridColumn: "span 2" }}>
                <span style={{ color: "var(--text-muted)" }}>Class Weight Strategy:</span> <strong>{metrics.best_parameters.class_weight}</strong>
              </div>
            </div>
          )}

          <div style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
            Random Seed: <strong>42 (Strict Reproducibility)</strong> | Scaler: <strong>StandardScaler</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
