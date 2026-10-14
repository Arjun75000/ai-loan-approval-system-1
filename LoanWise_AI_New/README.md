# LoanWise AI — Smart Loan Approval & Credit Risk Intelligence

**LoanWise AI** is an end-to-end, full-stack decision-support and credit risk analytics application powered by a trained **Decision Tree Machine Learning model**, complete with a **User Authentication System** and **Role-Based Admin Governance Console**. It enables prospective applicants and loan officers to evaluate loan eligibility, explore debt affordability, model what-if financial scenarios, and audit machine learning explainability with zero third-party AI API dependencies.

> **Legal Disclaimer:** LoanWise AI is an educational decision-support application. All predictions, risk classifications, and EMI values are mathematical and statistical estimates. They do NOT constitute formal bank approval decisions, loan guarantees, or professional financial advice.

---

## Key Features

1. **User Authentication & Personal Dashboard**
   - Secure registration, login, logout, password recovery, and profile management.
   - Passwords hashed with `bcryptjs`, sessions authenticated via signed JSON Web Tokens (`jwt`).
   - Personal User Dashboard (`/user/dashboard`) featuring personal loan KPIs, isolated analysis history, and profile customization.

2. **Role-Based Admin Governance Console**
   - Dedicated Admin Portal (`/admin/login` and `/admin/dashboard`) with strict RBAC middleware.
   - Real-time global statistics: registered user counts, total platform predictions, approval ratios, and risk stratum distributions.
   - User account management (search, filter, activate/deactivate accounts, secure deletion).
   - Cross-user prediction audit log and live ML model performance monitoring.
   - Automatic, secure first-admin seeding from environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) — users can never self-register as admin.

3. **Smart Loan Eligibility Analyzer**
   - 10-feature financial assessment form with strict frontend and backend schema validation.
   - Live inference via scikit-learn `DecisionTreeClassifier`.
   - Computes approval probability, risk category (Low, Medium, High, Very High), and key influencing features.
   - Generates downloadable compliance reports in JSON and CSV formats.

4. **Loan Affordability Calculator**
   - Independent mathematical financial calculator utilizing standard reducing-balance EMI formulas.
   - Calculates monthly payments, total debt burden, residual disposable income, and Debt-to-Income (DTI) ratio.
   - Interactive repayment composition charts powered by Recharts.
   - Robust edge-case handling for 0% promotional interest rates.

5. **What-If Scenario Lab**
   - Multi-scenario comparative simulation tool (up to 5 scenarios simultaneously).
   - Simulates modifications in tenure, borrowing principal, income, and existing liabilities.
   - Side-by-side matrix comparing ML classification, probability, and monthly cash flow.

6. **Explainable Credit Risk Dashboard**
   - Interactive diagnostic visualizations grounded directly in model training reports.
   - Real-time feature importance bar charts showing impurity reduction percentages.
   - Confusion matrix error breakdown detailing False Approvals vs False Rejections.
   - Class imbalance audit reflecting dataset distribution.

7. **System & Dataset Health Center**
   - Live verification of required columns and data types.
   - Model artifact inspection (model status, timestamp, hyperparameters).
   - Zero exposure of internal server paths or environment secrets.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Recharts, Vanilla CSS Design System |
| **Backend** | Node.js, Express.js, Mongoose, bcryptjs, jsonwebtoken, Express Rate Limit, CORS |
| **Database** | MongoDB (Local or MongoDB Atlas) |
| **Machine Learning** | Python 3.12, scikit-learn, pandas, NumPy, joblib, matplotlib, seaborn |
| **ML Model** | `DecisionTreeClassifier` with `StandardScaler` pipeline |
| **Hosting** | Vercel-ready frontend (`vercel.json`), Docker/Linux container-ready backend |

---

## Machine Learning Pipeline Summary

- **Dataset**: `AI_Loan_Approval_Dataset.csv` (2,000 historical records, 11 columns).
- **Target Label**: `Loan_Approved` (Binary classification: 0 = Rejected, 1 = Approved).
- **Features Evaluated**:
  1. `Age` (Years)
  2. `Monthly_Income` ($)
  3. `Credit_Score` (300-900)
  4. `Employment_Years` (Years)
  5. `Loan_Amount` ($)
  6. `Loan_Tenure_Months` (Months)
  7. `Existing_Loans` (Count)
  8. `Existing_EMI` ($)
  9. `Monthly_Expenses` ($)
  10. `Previous_Defaults` (Count)
- **Validation Strategy**: 80/20 Stratified Holdout Split (`random_state=42`).
- **Optimization**: `GridSearchCV` with 5-fold Stratified Cross-Validation optimizing F1-score with balanced class weighting.
- **Evaluation Baseline**: Compared against `DummyClassifier` (majority class strategy).

### Evaluated Model Metrics

| Metric | Score |
|---|---|
| **Test Accuracy** | 68.75% |
| **Baseline Accuracy** | 81.00% (Majority Class) |
| **Test F1-Score** | 0.4726 |
| **5-Fold Cross-Validation F1** | 0.4276 (±0.0206) |
| **ROC-AUC Score** | 0.7621 |
| **Optimal Hyperparameters** | `criterion='entropy'`, `max_depth=7`, `min_samples_leaf=10`, `class_weight='balanced'` |

---

## Project Structure

```
LoanWise_AI_New/
├── client/                     # React 19 + Vite Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # ProtectedRoute, AdminRoute, MetricCard, StatusBadge, etc.
│   │   ├── context/            # AuthContext.jsx (JWT auth state & methods)
│   │   ├── layouts/            # MainLayout (Sidebar, Navigation, Auth status)
│   │   ├── pages/              # 14 Application pages:
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EligibilityAnalyzer.jsx
│   │   │   ├── AffordabilityCalculator.jsx
│   │   │   ├── ScenarioLab.jsx
│   │   │   ├── LoanHistory.jsx
│   │   │   ├── ModelInsights.jsx
│   │   │   ├── HealthCenter.jsx
│   │   │   ├── SettingsAbout.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/           # Centralized API service with Bearer token injection
│   │   ├── styles/             # Vanilla CSS design system tokens
│   │   ├── App.jsx             # Router with ProtectedRoute and AdminRoute
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vercel.json             # Vercel SPA rewrites
│   └── vite.config.js
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # Database and environment configurations
│   │   ├── controllers/        # authController, adminController, loanController, etc.
│   │   ├── middleware/         # auth.js (JWT & RBAC), validation, error handling
│   │   ├── models/             # User.js, LoanAnalysis.js
│   │   ├── routes/             # authRoutes, adminRoutes, loanRoutes, mlRoutes, etc.
│   │   ├── services/           # mlService.js, emiService.js
│   │   ├── utils/              # seedAdmin.js, pythonRunner.js
│   │   └── index.js            # Express entry point with auto-seeding
│   └── package.json
├── ml/                         # Python Machine Learning Module
│   ├── data/                   # Dataset storage
│   ├── model/                  # Serialized .joblib artifacts
│   ├── reports/                # JSON metrics & diagnostic PNG plots
│   ├── prepare_data.py         # Data validation and preprocessing
│   ├── train_model.py          # Model training with GridSearchCV
│   ├── evaluate_model.py       # Diagnostic plot generation
│   ├── predict.py              # Subprocess JSON prediction interface
│   └── requirements.txt        # Python dependencies
├── docs/
│   └── DEPLOYMENT.md           # Production deployment procedures (Vercel, Render, Atlas)
├── .env.example                # Environment configuration template
├── .gitignore
├── IMPLEMENTATION_PLAN.md      # Engineering execution blueprint
├── vercel.json                 # Root Vercel deployment configuration
└── README.md
```

---

## Local Installation & Setup

### 1. Python Environment Setup
```bash
cd ml
pip install -r requirements.txt
python train_model.py
python evaluate_model.py
```

### 2. Backend Server Setup
```bash
cd ../server
npm install
npm start
```
The server will run on `http://localhost:5000`.

### 3. Frontend Client Setup
```bash
cd ../client
npm install
npm run dev
```
The application UI will run on `http://localhost:5173`.

---

## Default Initial Admin Credentials (Configurable via `.env`)

- **Portal URL**: `http://localhost:5173/admin/login`
- **Email**: `admin@loanwise.ai`
- **Password**: `Admin@LoanWise2026!`

*(These credentials can be modified anytime in `.env` before starting the server.)*

---

## REST API Reference

### Authentication Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT |
| `POST` | `/api/auth/admin/login` | Public | Authenticate administrator with role verification |
| `GET` | `/api/auth/profile` | Authenticated | Retrieve current user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update name or password |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset token |
| `POST` | `/api/auth/reset-password` | Public | Complete password reset |

### Administrator Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin | Global cross-user system analytics |
| `GET` | `/api/admin/users` | Admin | Paginated list of registered users |
| `PUT` | `/api/admin/users/:id/status` | Admin | Toggle account active/inactive status |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete user account and analyses |
| `GET` | `/api/admin/analyses` | Admin | Cross-user prediction audit feed |

### Loan & Prediction Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/loans/predict` | Public/Optional Auth | Run Decision Tree prediction (links to user if logged in) |
| `POST` | `/api/loans/compare` | Public | Batch comparative prediction & affordability |
| `POST` | `/api/loans/calculate-emi` | Public | Reducing-balance EMI and DTI calculation |
| `GET` | `/api/loans/user-stats` | Authenticated | Personal user dashboard KPI metrics |
| `GET` | `/api/loans/history` | Optional Auth | Analysis history (isolated to user if logged in) |
| `GET` | `/api/loans/:id` | Optional Auth | Fetch single historical analysis |
| `DELETE` | `/api/loans/:id` | Optional Auth | Delete analysis record |
| `GET` | `/api/reports/:id` | Public | Download report in JSON or CSV format |

---

## Vercel Deployment Instructions

1. Push your repository to GitHub.
2. In Vercel, import the repository and select **Vite** preset.
3. Set the Root Directory to `client` (or use the root `vercel.json`).
4. Set the build command to `npm run build` and output directory to `dist`.
5. Set `VITE_API_URL` to your production backend URL.
6. Click **Deploy**. SPA routing rewrites are pre-configured in `client/vercel.json`.
