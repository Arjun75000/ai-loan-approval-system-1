import React from "react";
import { DisclaimerBanner } from "../components/DisclaimerBanner";

export const SettingsAbout = () => {
  return (
    <div>
      <div className="page-header">
        <h2>About LoanWise AI & Architecture</h2>
        <p>System principles, machine learning governance, and deployment reference</p>
      </div>

      <DisclaimerBanner />

      <div className="grid-cols-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Project Purpose & Governance</div>
          </div>
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            <p style={{ marginBottom: "12px" }}>
              <strong>LoanWise AI</strong> is a full-stack, educational credit-risk intelligence platform built to illustrate the practical deployment of machine learning in consumer lending.
            </p>
            <p style={{ marginBottom: "12px" }}>
              Unlike black-box generative models or opaque external APIs, LoanWise AI employs an interpretable <strong>Decision Tree Classifier</strong> trained on localized applicant attributes. Each decision maps directly to statistical feature splits without hidden dependencies.
            </p>
            <p>
              <strong>Important Disclaimer:</strong> All predictions, risk classifications, and affordability outputs are simulated estimates intended exclusively for research, training, and portfolio demonstration. They must never be construed as binding bank commitments or certified financial advice.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Technology Stack Overview</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
            <div style={{ background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: "6px" }}>
              <strong>Frontend:</strong> React 19, Vite, React Router, Recharts, Vanilla CSS
            </div>
            <div style={{ background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: "6px" }}>
              <strong>Backend:</strong> Node.js, Express.js, Mongoose, Express Rate Limit
            </div>
            <div style={{ background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: "6px" }}>
              <strong>Database:</strong> MongoDB with structured Mongoose schemas
            </div>
            <div style={{ background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: "6px" }}>
              <strong>Machine Learning:</strong> Python 3.12, scikit-learn, pandas, NumPy, joblib
            </div>
            <div style={{ background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: "6px" }}>
              <strong>Integration:</strong> Safe Node.js child_process JSON stream to Python
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "24px" }}>
        <div className="card-header">
          <div className="card-title">Retraining with Custom Datasets</div>
        </div>
        <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          <p style={{ marginBottom: "10px" }}>
            To supply an updated dataset or retrain the Decision Tree model on new historical records:
          </p>
          <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li>Place your new CSV file at <code>ml/data/loan_dataset.csv</code> ensuring all 11 required columns are present.</li>
            <li>Run the automated data validation and training pipeline: <code>python ml/train_model.py</code>.</li>
            <li>Generate updated diagnostic visualization charts: <code>python ml/evaluate_model.py</code>.</li>
            <li>The Node.js server automatically detects updated <code>model_status.json</code> and serialized joblib artifacts.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
