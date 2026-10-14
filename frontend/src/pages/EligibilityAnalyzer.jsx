import React, { useState } from "react";
import { api } from "../services/api";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const EligibilityAnalyzer = () => {
  const initialFormState = {
    Age: 32,
    Monthly_Income: 65000,
    Credit_Score: 720,
    Employment_Years: 6,
    Loan_Amount: 350000,
    Loan_Tenure_Months: 48,
    Existing_Loans: 1,
    Existing_EMI: 8500,
    Monthly_Expenses: 22000,
    Previous_Defaults: 0,
    scenario_name: "Primary Application"
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  const validate = () => {
    const errors = {};
    if (!formData.Age || formData.Age < 18 || formData.Age > 100) {
      errors.Age = "Age must be between 18 and 100";
    }
    if (formData.Monthly_Income === "" || formData.Monthly_Income < 0) {
      errors.Monthly_Income = "Monthly Income must be 0 or greater";
    }
    if (!formData.Credit_Score || formData.Credit_Score < 300 || formData.Credit_Score > 900) {
      errors.Credit_Score = "Credit Score must be between 300 and 900";
    }
    if (formData.Employment_Years === "" || formData.Employment_Years < 0 || formData.Employment_Years > 50) {
      errors.Employment_Years = "Employment Years must be between 0 and 50";
    }
    if (!formData.Loan_Amount || formData.Loan_Amount <= 0) {
      errors.Loan_Amount = "Loan Amount must be greater than 0";
    }
    if (!formData.Loan_Tenure_Months || formData.Loan_Tenure_Months < 1 || formData.Loan_Tenure_Months > 360) {
      errors.Loan_Tenure_Months = "Tenure must be between 1 and 360 months";
    }
    if (formData.Existing_Loans === "" || formData.Existing_Loans < 0) {
      errors.Existing_Loans = "Existing Loans must be 0 or greater";
    }
    if (formData.Existing_EMI === "" || formData.Existing_EMI < 0) {
      errors.Existing_EMI = "Existing EMI must be 0 or greater";
    }
    if (formData.Monthly_Expenses === "" || formData.Monthly_Expenses < 0) {
      errors.Monthly_Expenses = "Monthly Expenses must be 0 or greater";
    }
    if (formData.Previous_Defaults === "" || formData.Previous_Defaults < 0) {
      errors.Previous_Defaults = "Previous Defaults must be 0 or greater";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "scenario_name" ? value : Number(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const res = await api.predictLoan(formData);
      if (res && res.data) {
        setResult(res.data);
      } else {
        throw new Error(res.error || "Prediction request did not return data");
      }
    } catch (err) {
      setApiError(err.message || "Failed to communicate with prediction service");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setResult(null);
    setApiError(null);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Smart Loan Eligibility Analyzer</h2>
        <p>Evaluate creditworthiness using a trained Scikit-Learn Decision Tree model</p>
      </div>

      <DisclaimerBanner />

      {apiError && <div className="error-banner">{apiError}</div>}

      <div className="grid-cols-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Applicant Financial Profile</div>
            <button className="btn btn-secondary btn-sm" onClick={handleReset} type="button">
              Reset Form
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Applicant Age</label>
                <input
                  type="number"
                  className="form-control"
                  name="Age"
                  value={formData.Age}
                  onChange={handleChange}
                  min="18"
                  max="100"
                />
                {formErrors.Age && <span style={{ color: "var(--danger)", fontSize: "11px" }}>{formErrors.Age}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Income ($)</label>
                <input
                  type="number"
                  className="form-control"
                  name="Monthly_Income"
                  value={formData.Monthly_Income}
                  onChange={handleChange}
                  min="0"
                />
                {formErrors.Monthly_Income && <span style={{ color: "var(--danger)", fontSize: "11px" }}>{formErrors.Monthly_Income}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Credit Score (300-900)</label>
                <input
                  type="number"
                  className="form-control"
                  name="Credit_Score"
                  value={formData.Credit_Score}
                  onChange={handleChange}
                  min="300"
                  max="900"
                />
                {formErrors.Credit_Score && <span style={{ color: "var(--danger)", fontSize: "11px" }}>{formErrors.Credit_Score}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Employment Experience (Years)</label>
                <input
                  type="number"
                  className="form-control"
                  name="Employment_Years"
                  value={formData.Employment_Years}
                  onChange={handleChange}
                  min="0"
                  max="50"
                />
                {formErrors.Employment_Years && <span style={{ color: "var(--danger)", fontSize: "11px" }}>{formErrors.Employment_Years}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Requested Loan Amount ($)</label>
                <input
                  type="number"
                  className="form-control"
                  name="Loan_Amount"
                  value={formData.Loan_Amount}
                  onChange={handleChange}
                  min="1"
                />
                {formErrors.Loan_Amount && <span style={{ color: "var(--danger)", fontSize: "11px" }}>{formErrors.Loan_Amount}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Tenure (Months)</label>
                <input
                  type="number"
                  className="form-control"
                  name="Loan_Tenure_Months"
                  value={formData.Loan_Tenure_Months}
                  onChange={handleChange}
                  min="1"
                  max="360"
                />
                {formErrors.Loan_Tenure_Months && <span style={{ color: "var(--danger)", fontSize: "11px" }}>{formErrors.Loan_Tenure_Months}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Existing Active Loans</label>
                <input
                  type="number"
                  className="form-control"
                  name="Existing_Loans"
                  value={formData.Existing_Loans}
                  onChange={handleChange}
                  min="0"
                />
                {formErrors.Existing_Loans && <span style={{ color: "var(--danger)", fontSize: "11px" }}>{formErrors.Existing_Loans}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Existing Monthly EMI ($)</label>
                <input
                  type="number"
                  className="form-control"
                  name="Existing_EMI"
                  value={formData.Existing_EMI}
                  onChange={handleChange}
                  min="0"
                />
                {formErrors.Existing_EMI && <span style={{ color: "var(--danger)", fontSize: "11px" }}>{formErrors.Existing_EMI}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Living Expenses ($)</label>
                <input
                  type="number"
                  className="form-control"
                  name="Monthly_Expenses"
                  value={formData.Monthly_Expenses}
                  onChange={handleChange}
                  min="0"
                />
                {formErrors.Monthly_Expenses && <span style={{ color: "var(--danger)", fontSize: "11px" }}>{formErrors.Monthly_Expenses}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Previous Historical Defaults</label>
                <input
                  type="number"
                  className="form-control"
                  name="Previous_Defaults"
                  value={formData.Previous_Defaults}
                  onChange={handleChange}
                  min="0"
                />
                {formErrors.Previous_Defaults && <span style={{ color: "var(--danger)", fontSize: "11px" }}>{formErrors.Previous_Defaults}</span>}
              </div>
            </div>

            <div style={{ marginTop: "24px" }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%" }}
                disabled={loading}
              >
                {loading ? "Executing Decision Tree..." : "Evaluate Loan Eligibility"}
              </button>
            </div>
          </form>
        </div>

        <div>
          {loading && <LoadingSpinner message="Consulting trained ML Decision Tree..." />}

          {!loading && !result && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Prediction Intelligence</div>
              </div>
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎯</div>
                <h4>Awaiting Assessment Input</h4>
                <p style={{ fontSize: "13px", marginTop: "8px" }}>
                  Fill in the applicant profile on the left and submit to view model classification, risk category, confidence scores, and feature breakdown.
                </p>
              </div>
            </div>
          )}

          {!loading && result && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Model Evaluation Outcome</div>
                {result.saved && <span style={{ fontSize: "12px", color: "var(--success)" }}>✓ Saved to History</span>}
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
                <StatusBadge type={result.prediction_label} />
                <StatusBadge type={result.risk_category} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div style={{ background: "var(--bg-tertiary)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Approval Probability</div>
                  <div style={{ fontSize: "22px", fontWeight: "700", color: result.prediction === 1 ? "var(--success)" : "var(--danger)" }}>
                    {(result.approval_probability * 100).toFixed(1)}%
                  </div>
                </div>
                <div style={{ background: "var(--bg-tertiary)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Risk Stratum</div>
                  <div style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)" }}>
                    {result.risk_category}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Model Explanation</h4>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, background: "var(--bg-tertiary)", padding: "12px", borderRadius: "8px" }}>
                  {result.explanation}
                </div>
              </div>

              {result.feature_importance && result.feature_importance.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "14px", marginBottom: "10px" }}>Key Influencing Features</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {result.feature_importance.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ fontWeight: "500" }}>{item.feature.replace(/_/g, " ")}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "50%" }}>
                          <div style={{ flex: 1, height: "6px", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${item.importance * 100}%`, height: "100%", background: "var(--accent-primary)" }}></div>
                          </div>
                          <span style={{ fontFamily: "var(--font-mono)", width: "42px", textAlign: "right" }}>
                            {(item.importance * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.id && (
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <a
                    href={api.getReportDownloadUrl(result.id, "json")}
                    className="btn btn-secondary btn-sm"
                    download
                  >
                    Download JSON Report
                  </a>
                  <a
                    href={api.getReportDownloadUrl(result.id, "csv")}
                    className="btn btn-secondary btn-sm"
                    download
                  >
                    Download CSV Report
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
