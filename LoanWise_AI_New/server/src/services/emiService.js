const calculateEmi = ({ principal, annual_interest_rate, tenure_months, existing_emi = 0, monthly_income = 0, monthly_expenses = 0 }) => {
  const P = Number(principal);
  const annualRate = Number(annual_interest_rate);
  const N = Number(tenure_months);
  const existingEmi = Number(existing_emi) || 0;
  const income = Number(monthly_income) || 0;
  const expenses = Number(monthly_expenses) || 0;

  let emi;

  if (annualRate === 0) {
    emi = P / N;
  } else {
    const monthlyRate = annualRate / 12 / 100;
    emi = (P * monthlyRate * Math.pow(1 + monthlyRate, N)) / (Math.pow(1 + monthlyRate, N) - 1);
  }

  const totalRepayment = emi * N;
  const totalInterest = totalRepayment - P;
  const totalMonthlyEmi = existingEmi + emi;
  const remainingIncome = income - expenses - totalMonthlyEmi;
  const emiToIncomeRatio = income > 0 ? (totalMonthlyEmi / income) * 100 : 0;

  return {
    emi: Math.round(emi * 100) / 100,
    total_repayment: Math.round(totalRepayment * 100) / 100,
    total_interest: Math.round(totalInterest * 100) / 100,
    total_monthly_emi: Math.round(totalMonthlyEmi * 100) / 100,
    remaining_income: Math.round(remainingIncome * 100) / 100,
    emi_to_income_ratio: Math.round(emiToIncomeRatio * 100) / 100,
    inputs: {
      principal: P,
      annual_interest_rate: annualRate,
      tenure_months: N,
      existing_emi: existingEmi,
      monthly_income: income,
      monthly_expenses: expenses
    },
    note: "The interest rate is a user-entered assumption. This calculator uses the standard reducing-balance EMI formula. Results are estimates and do not represent actual bank terms."
  };
};

module.exports = { calculateEmi };
