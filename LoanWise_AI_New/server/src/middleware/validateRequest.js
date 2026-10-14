const { AppError } = require("./errorHandler");

const FEATURE_FIELDS = [
  { name: "Age", min: 18, max: 100 },
  { name: "Monthly_Income", min: 0, max: 10000000 },
  { name: "Credit_Score", min: 300, max: 900 },
  { name: "Employment_Years", min: 0, max: 50 },
  { name: "Loan_Amount", min: 1, max: 100000000 },
  { name: "Loan_Tenure_Months", min: 1, max: 360 },
  { name: "Existing_Loans", min: 0, max: 20 },
  { name: "Existing_EMI", min: 0, max: 10000000 },
  { name: "Monthly_Expenses", min: 0, max: 10000000 },
  { name: "Previous_Defaults", min: 0, max: 20 }
];

const validateLoanInput = (req, res, next) => {
  const errors = [];

  for (const field of FEATURE_FIELDS) {
    const value = req.body[field.name];

    if (value === undefined || value === null || value === "") {
      errors.push(`${field.name} is required`);
      continue;
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
      errors.push(`${field.name} must be a valid number`);
      continue;
    }

    if (numValue < field.min || numValue > field.max) {
      errors.push(`${field.name} must be between ${field.min} and ${field.max}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors
    });
  }

  next();
};

const validateEmiInput = (req, res, next) => {
  const errors = [];
  const { principal, annual_interest_rate, tenure_months, existing_emi, monthly_income, monthly_expenses } = req.body;

  if (!principal || Number(principal) <= 0) {
    errors.push("Principal (loan amount) must be a positive number");
  }

  if (annual_interest_rate === undefined || annual_interest_rate === null || Number(annual_interest_rate) < 0) {
    errors.push("Annual interest rate must be zero or a positive number");
  }

  if (!tenure_months || Number(tenure_months) < 1) {
    errors.push("Tenure must be at least 1 month");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors
    });
  }

  next();
};

const validateObjectId = (req, res, next) => {
  const id = req.params.id;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format"
    });
  }
  next();
};

module.exports = { validateLoanInput, validateEmiInput, validateObjectId };
