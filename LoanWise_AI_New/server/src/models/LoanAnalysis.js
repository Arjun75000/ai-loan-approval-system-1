const mongoose = require("mongoose");

const loanAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  userEmail: {
    type: String,
    default: null
  },
  inputs: {
    Age: { type: Number, required: true },
    Monthly_Income: { type: Number, required: true },
    Credit_Score: { type: Number, required: true },
    Employment_Years: { type: Number, required: true },
    Loan_Amount: { type: Number, required: true },
    Loan_Tenure_Months: { type: Number, required: true },
    Existing_Loans: { type: Number, required: true },
    Existing_EMI: { type: Number, required: true },
    Monthly_Expenses: { type: Number, required: true },
    Previous_Defaults: { type: Number, required: true }
  },
  prediction: {
    result: { type: Number, required: true },
    label: { type: String, required: true },
    approval_probability: { type: Number },
    risk_category: { type: String },
    explanation: { type: String }
  },
  affordability: {
    emi: { type: Number },
    total_repayment: { type: Number },
    total_interest: { type: Number },
    total_monthly_emi: { type: Number },
    remaining_income: { type: Number },
    emi_to_income_ratio: { type: Number },
    interest_rate: { type: Number },
    loan_amount: { type: Number },
    tenure_months: { type: Number }
  },
  scenario_name: { type: String, default: "Default Scenario" },
  is_demo: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

loanAnalysisSchema.index({ userId: 1, created_at: -1 });
loanAnalysisSchema.index({ created_at: -1 });
loanAnalysisSchema.index({ "prediction.label": 1 });
loanAnalysisSchema.index({ "prediction.risk_category": 1 });

module.exports = mongoose.model("LoanAnalysis", loanAnalysisSchema);
