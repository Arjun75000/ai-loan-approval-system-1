import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import { MetricCard } from "../components/MetricCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export const AffordabilityCalculator = () => {
  const [inputs, setInputs] = useState({
    principal: 400000,
    annual_interest_rate: 8.5,
    tenure_months: 60,
    existing_emi: 5000,
    monthly_income: 60000,
    monthly_expenses: 20000
  });

  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculate = async (calcInputs) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.calculateEmi(calcInputs);
      if (res && res.data) {
        setCalculation(res.data);
      }
    } catch (err) {
      setError(err.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate(inputs);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = {
      ...inputs,
      [name]: Number(value)
    };
    setInputs(updated);
    calculate(updated);
  };

  const chartData = calculation ? [
    { name: "Principal Amount", value: calculation.inputs.principal, color: "#2563eb" },
    { name: "Total Interest", value: Math.max(0, calculation.total_interest), color: "#f59e0b" }
  ] : [];

  return (
    <div>
      <div className="page-header">
        <h2>Loan Affordability & EMI Calculator</h2>
        <p>Standard reducing-balance mathematical debt modeling & disposable income assessment</p>
      </div>

      <DisclaimerBanner text="The annual interest rate is a user-entered assumption. The EMI calculator uses standard financial formulas and is completely independent of the ML classification model. Results do not represent guaranteed bank terms." />

      {error && <div className="error-banner">{error}</div>}

      <div className="grid-cols-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Loan & Cashflow Parameters</div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Loan Principal ($)</label>
              <input
                type="number"
                className="form-control"
                name="principal"
                value={inputs.principal}
                onChange={handleChange}
                min="1000"
                step="1000"
              />
              <span className="form-helper">Desired borrowing amount</span>
            </div>

            <div className="form-group">
              <label className="form-label">Annual Interest Rate (%)</label>
              <input
                type="number"
                className="form-control"
                name="annual_interest_rate"
                value={inputs.annual_interest_rate}
                onChange={handleChange}
                min="0"
                max="50"
                step="0.1"
              />
              <span className="form-helper">Assumed nominal annual rate</span>
            </div>

            <div className="form-group">
              <label className="form-label">Loan Tenure (Months)</label>
              <input
                type="number"
                className="form-control"
                name="tenure_months"
                value={inputs.tenure_months}
                onChange={handleChange}
                min="1"
                max="360"
              />
              <span className="form-helper">{Math.floor(inputs.tenure_months / 12)} years {inputs.tenure_months % 12} months</span>
            </div>

            <div className="form-group">
              <label className="form-label">Current Existing EMI ($)</label>
              <input
                type="number"
                className="form-control"
                name="existing_emi"
                value={inputs.existing_emi}
                onChange={handleChange}
                min="0"
              />
              <span className="form-helper">Other active monthly loan payments</span>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Gross Income ($)</label>
              <input
                type="number"
                className="form-control"
                name="monthly_income"
                value={inputs.monthly_income}
                onChange={handleChange}
                min="0"
              />
              <span className="form-helper">Total monthly earnings</span>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Living Expenses ($)</label>
              <input
                type="number"
                className="form-control"
                name="monthly_expenses"
                value={inputs.monthly_expenses}
                onChange={handleChange}
                min="0"
              />
              <span className="form-helper">Living & operational expenditures</span>
            </div>
          </div>
        </div>

        {calculation && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">Repayment & Debt Burden Summary</div>
            </div>

            <div className="grid-cols-2" style={{ marginBottom: "20px" }}>
              <div style={{ background: "var(--bg-tertiary)", padding: "16px", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Estimated Monthly EMI</div>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "var(--accent-primary)" }}>
                  ${calculation.emi.toLocaleString()}
                </div>
              </div>

              <div style={{ background: "var(--bg-tertiary)", padding: "16px", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Monthly Debt (New + Existing)</div>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)" }}>
                  ${calculation.total_monthly_emi.toLocaleString()}
                </div>
              </div>

              <div style={{ background: "var(--bg-tertiary)", padding: "16px", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Net Residual Income</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: calculation.remaining_income >= 0 ? "var(--success)" : "var(--danger)" }}>
                  ${calculation.remaining_income.toLocaleString()}
                </div>
              </div>

              <div style={{ background: "var(--bg-tertiary)", padding: "16px", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Debt-to-Income (DTI)</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: calculation.emi_to_income_ratio > 50 ? "var(--danger)" : calculation.emi_to_income_ratio > 35 ? "var(--warning)" : "var(--success)" }}>
                  {calculation.emi_to_income_ratio}%
                </div>
              </div>
            </div>

            <div style={{ height: "220px", marginTop: "10px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "14px", borderTop: "1px solid var(--border-color)", paddingTop: "10px" }}>
              Total Repayment: ${calculation.total_repayment.toLocaleString()} | Accrued Interest: ${calculation.total_interest.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
