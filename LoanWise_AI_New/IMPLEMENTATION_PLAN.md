# LoanWise AI — Implementation Plan

## Project Overview

**LoanWise AI — Smart Loan Approval & Credit Risk Intelligence**

A professional, portfolio-worthy educational decision-support application that helps users explore loan eligibility, understand financial risk, estimate affordability, and compare loan scenarios using a real Decision Tree ML model.

> **Disclaimer**: All predictions are estimates for educational purposes only. They are not actual bank approvals or financial advice.

---

## Phase 1: Project Setup & Dataset Preparation

### 1.1 Project Structure Creation
- Create full directory tree for client/, server/, ml/, docs/
- Initialize package.json files for client and server
- Create .env.example, .gitignore, README.md

### 1.2 Dataset Handling
- **Source**: `AI_Loan_Approval_Dataset.csv` — 2000 rows, 11 columns
- **Columns**: Age, Monthly_Income, Credit_Score, Employment_Years, Loan_Amount, Loan_Tenure_Months, Existing_Loans, Existing_EMI, Monthly_Expenses, Previous_Defaults, Loan_Approved
- Copy CSV to ml/data/ (keep original untouched)
- Validate schema, data types, missing values, duplicates, class distribution

### 1.3 Files Created
- `ml/data/loan_dataset.csv`
- `ml/prepare_data.py`
- `ml/requirements.txt`

---

## Phase 2: Machine Learning Pipeline

### 2.1 Data Preparation (prepare_data.py)
- Load CSV, validate columns and types
- Report missing values, duplicates, class distribution
- Save validation report to ml/reports/

### 2.2 Model Training (train_model.py)
- DecisionTreeClassifier from scikit-learn
- Stratified 80/20 train/test split
- GridSearchCV for hyperparameter tuning
- 5-fold stratified cross-validation
- Compare with DummyClassifier baseline
- Save model + scaler pipeline via joblib
- Fixed random seed (42)

### 2.3 Model Evaluation (evaluate_model.py)
- Full metrics suite (accuracy, precision, recall, F1, confusion matrix, ROC-AUC)
- Generate evaluation plots
- Save all to ml/reports/

### 2.4 Prediction Interface (predict.py)
- Accept JSON input via stdin, output JSON via stdout
- Return: prediction, probability, risk category, feature importance

---

## Phase 3: Backend (Node.js + Express + MongoDB)

### 3.1 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Server health check |
| GET | /api/ml/status | Model training status |
| GET | /api/ml/metrics | Model evaluation metrics |
| GET | /api/ml/feature-importance | Feature importance data |
| POST | /api/loans/predict | Run ML prediction |
| POST | /api/loans/compare | Compare multiple scenarios |
| POST | /api/loans/calculate-emi | EMI calculation |
| GET | /api/loans/history | Paginated history |
| GET | /api/loans/:id | Single analysis detail |
| DELETE | /api/loans/:id | Delete analysis |
| GET | /api/reports/:id | Download report |

---

## Phase 4: Frontend (React + Vite)

### 4.1 Pages
1. Dashboard
2. Loan Eligibility Analyzer
3. Affordability Calculator
4. What-if Scenario Lab
5. Loan History
6. Model Insights
7. Dataset & Model Health
8. Settings / About

---

## Execution Order

1. Create project structure and config files
2. Copy and validate dataset
3. Build complete ML pipeline
4. Run ML training and generate reports
5. Build Express backend with all endpoints
6. Build React frontend with all pages
7. Integration testing
8. Documentation
9. Final verification
