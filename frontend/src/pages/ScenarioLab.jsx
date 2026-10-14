import React, { useState } from "react";
import { api } from "../services/api";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const ScenarioLab = () => {
  const defaultScenarios = [
    {
      scenario_name: "Scenario A (Baseline)",
      Age: 30,
      Monthly_Income: 50000,
      Credit_Score: 680,
      Employment_Years: 4,
      Loan_Amount: 500000,
      Loan_Tenure_Months: 36,
      Existing_Loans: 2,
      Existing_EMI: 10000,
      Monthly_Expenses: 22000,
      Previous_Defaults: 1,
      interest_rate: 9.5
    },
    {
      scenario_name: "Scenario B (Longer Tenure)",
      Age: 30,
      Monthly_Income: 50000,
      Credit_Score: 680,
      Employment_Years: 4,
      Loan_Amount: 500000,
      Loan_Tenure_Months: 72,
      Existing_Loans: 2,
      Existing_EMI: 10000,
      Monthly_Expenses: 22000,
      Previous_Defaults: 1,
      interest_rate: 9.5
    },
    {
      scenario_name: "Scenario C (Lower Debt & Amount)",
      Age: 30,
      Monthly_Income: 50000,
      Credit_Score: 720,
      Employment_Years: 4,
      Loan_Amount: 300000,
      Loan_Tenure_Months: 48,
      Existing_Loans: 0,
      Existing_EMI: 0,
      Monthly_Expenses: 20000,
      Previous_Defaults: 0,
      interest_rate: 8.5
    }
  ];

  const [scenarios, setScenarios] = useState(defaultScenarios);
  const [comparisons, setComparisons] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFieldChange = (index, field, value) => {
    const updated = [...scenarios];
    updated[index] = {
      ...updated[index],
      [field]: field === "scenario_name" ? value : Number(value)
    };
    setScenarios(updated);
  };

  const handleAddScenario = () => {
    if (scenarios.length >= 5) return;
    const base = scenarios[0];
    setScenarios([
      ...scenarios,
      {
        ...base,
        scenario_name: `Scenario ${String.fromCharCode(65 + scenarios.length)}`
      }
    ]);
  };

  const handleRemoveScenario = (index) => {
    if (scenarios.length <= 2) return;
    setScenarios(scenarios.filter((_, i) => i !== index));
  };

  const runComparison = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.compareScenarios(scenarios);
      if (res && res.data) {
        setComparisons(res.data.comparisons);
      }
    } catch (err) {
      setError(err.message || "Failed to run scenario comparison");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>What-If Scenario Lab</h2>
        <p>Simulate parameter variations and inspect how terms impact ML classification and EMI affordability</p>
      </div>

      <DisclaimerBanner text="Notice: Modifying input variables in this simulation illustrates mathematical model sensitivity. It does not guarantee that a real-world financial institution will approve or reject terms similarly." />

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Scenario Configurations</div>
          <div style={{ display: "flex", gap: "10px" }}>
            {scenarios.length < 5 && (
              <button className="btn btn-secondary btn-sm" onClick={handleAddScenario}>
                + Add Scenario
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={runComparison} disabled={loading}>
              {loading ? "Comparing..." : "Execute Comparison"}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${scenarios.length}, 1fr)`, gap: "16px", overflowX: "auto" }}>
          {scenarios.map((scenario, idx) => (
            <div key={idx} style={{ background: "var(--bg-tertiary)", padding: "16px", borderRadius: "10px", minWidth: "240px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <input
                  type="text"
                  value={scenario.scenario_name}
                  onChange={(e) => handleFieldChange(idx, "scenario_name", e.target.value)}
                  style={{ fontWeight: "700", border: "none", background: "transparent", color: "var(--text-primary)", fontSize: "14px", width: "80%" }}
                />
                {scenarios.length > 2 && (
                  <button
                    onClick={() => handleRemoveScenario(idx)}
                    style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "16px" }}
                    title="Remove scenario"
                  >
                    ×
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "11px" }}>Loan Amount ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ padding: "6px 8px", fontSize: "13px" }}
                    value={scenario.Loan_Amount}
                    onChange={(e) => handleFieldChange(idx, "Loan_Amount", e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "11px" }}>Tenure (Months)</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ padding: "6px 8px", fontSize: "13px" }}
                    value={scenario.Loan_Tenure_Months}
                    onChange={(e) => handleFieldChange(idx, "Loan_Tenure_Months", e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "11px" }}>Monthly Income ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ padding: "6px 8px", fontSize: "13px" }}
                    value={scenario.Monthly_Income}
                    onChange={(e) => handleFieldChange(idx, "Monthly_Income", e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "11px" }}>Credit Score</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ padding: "6px 8px", fontSize: "13px" }}
                    value={scenario.Credit_Score}
                    onChange={(e) => handleFieldChange(idx, "Credit_Score", e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "11px" }}>Existing Monthly EMI ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ padding: "6px 8px", fontSize: "13px" }}
                    value={scenario.Existing_EMI}
                    onChange={(e) => handleFieldChange(idx, "Existing_EMI", e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "11px" }}>Assumed Rate (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ padding: "6px 8px", fontSize: "13px" }}
                    value={scenario.interest_rate}
                    onChange={(e) => handleFieldChange(idx, "interest_rate", e.target.value)}
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading && <LoadingSpinner message="Calculating simultaneous predictions and repayment metrics..." />}

      {comparisons && !loading && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Comparative Analysis Matrix</div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric / Dimension</th>
                  {comparisons.map((c, i) => (
                    <th key={i}>{c.scenario_name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>ML Prediction Decision</strong></td>
                  {comparisons.map((c, i) => (
                    <td key={i}>
                      <StatusBadge type={c.prediction.prediction_label} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Model Approval Probability</strong></td>
                  {comparisons.map((c, i) => (
                    <td key={i} style={{ fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                      {(c.prediction.approval_probability * 100).toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Assigned Risk Stratum</strong></td>
                  {comparisons.map((c, i) => (
                    <td key={i}>
                      <StatusBadge type={c.prediction.risk_category} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>New Monthly EMI</strong></td>
                  {comparisons.map((c, i) => (
                    <td key={i} style={{ fontWeight: "600" }}>
                      ${c.affordability.emi.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Total Debt Burden (New + Existing)</strong></td>
                  {comparisons.map((c, i) => (
                    <td key={i}>
                      ${c.affordability.total_monthly_emi.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Residual Disposable Income</strong></td>
                  {comparisons.map((c, i) => (
                    <td key={i} style={{ color: c.affordability.remaining_income >= 0 ? "var(--success)" : "var(--danger)", fontWeight: "600" }}>
                      ${c.affordability.remaining_income.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Debt-to-Income (DTI) Ratio</strong></td>
                  {comparisons.map((c, i) => (
                    <td key={i} style={{ fontWeight: "600" }}>
                      {c.affordability.emi_to_income_ratio}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Total Accrued Interest</strong></td>
                  {comparisons.map((c, i) => (
                    <td key={i}>
                      ${c.affordability.total_interest.toLocaleString()}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
