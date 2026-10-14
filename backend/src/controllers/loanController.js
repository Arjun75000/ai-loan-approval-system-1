const LoanAnalysis = require("../models/LoanAnalysis");
const mlService = require("../services/mlService");
const { calculateEmi } = require("../services/emiService");
const { getDatabaseStatus } = require("../config/database");

const predict = async (req, res, next) => {
  try {
    const inputData = {
      Age: Number(req.body.Age),
      Monthly_Income: Number(req.body.Monthly_Income),
      Credit_Score: Number(req.body.Credit_Score),
      Employment_Years: Number(req.body.Employment_Years),
      Loan_Amount: Number(req.body.Loan_Amount),
      Loan_Tenure_Months: Number(req.body.Loan_Tenure_Months),
      Existing_Loans: Number(req.body.Existing_Loans),
      Existing_EMI: Number(req.body.Existing_EMI),
      Monthly_Expenses: Number(req.body.Monthly_Expenses),
      Previous_Defaults: Number(req.body.Previous_Defaults)
    };

    const result = await mlService.runPrediction(inputData);

    if (!result.success) {
      return res.status(result.demo_mode ? 503 : 500).json(result);
    }

    let savedRecord = null;
    const dbStatus = getDatabaseStatus();

    if (dbStatus.connected) {
      try {
        const analysis = new LoanAnalysis({
          inputs: inputData,
          prediction: {
            result: result.prediction,
            label: result.prediction_label,
            approval_probability: result.approval_probability,
            risk_category: result.risk_category,
            explanation: result.explanation
          },
          scenario_name: req.body.scenario_name || "Default Scenario"
        });
        savedRecord = await analysis.save();
      } catch (dbError) {
        console.error("Failed to save analysis:", dbError.message);
      }
    }

    res.json({
      success: true,
      data: {
        id: savedRecord ? savedRecord._id : null,
        ...result,
        saved: !!savedRecord,
        db_available: dbStatus.connected
      }
    });
  } catch (error) {
    next(error);
  }
};

const compareScenarios = async (req, res, next) => {
  try {
    const { scenarios } = req.body;

    if (!Array.isArray(scenarios) || scenarios.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Please provide at least 2 scenarios to compare"
      });
    }

    if (scenarios.length > 5) {
      return res.status(400).json({
        success: false,
        error: "Maximum 5 scenarios allowed"
      });
    }

    const results = await mlService.runBatchPrediction(scenarios);

    if (!results.success) {
      return res.status(results.demo_mode ? 503 : 500).json(results);
    }

    const enrichedResults = results.results.map((result, index) => {
      const scenario = scenarios[index];
      const emiData = calculateEmi({
        principal: scenario.Loan_Amount,
        annual_interest_rate: scenario.interest_rate || 10,
        tenure_months: scenario.Loan_Tenure_Months,
        existing_emi: scenario.Existing_EMI,
        monthly_income: scenario.Monthly_Income,
        monthly_expenses: scenario.Monthly_Expenses
      });

      return {
        scenario_index: index,
        scenario_name: scenario.scenario_name || `Scenario ${index + 1}`,
        prediction: result,
        affordability: emiData
      };
    });

    res.json({
      success: true,
      data: {
        comparisons: enrichedResults,
        disclaimer: "Changing inputs does not guarantee a real bank's decision will change in the same way. These comparisons are educational estimates only."
      }
    });
  } catch (error) {
    next(error);
  }
};

const calculateEmiEndpoint = (req, res) => {
  const result = calculateEmi({
    principal: req.body.principal,
    annual_interest_rate: req.body.annual_interest_rate,
    tenure_months: req.body.tenure_months,
    existing_emi: req.body.existing_emi,
    monthly_income: req.body.monthly_income,
    monthly_expenses: req.body.monthly_expenses
  });

  res.json({
    success: true,
    data: result
  });
};

const getHistory = async (req, res, next) => {
  try {
    const dbStatus = getDatabaseStatus();

    if (!dbStatus.connected) {
      return res.json({
        success: true,
        data: [],
        total: 0,
        message: "Database is not connected. History is unavailable."
      });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.prediction) {
      filter["prediction.label"] = req.query.prediction;
    }
    if (req.query.risk_category) {
      filter["prediction.risk_category"] = req.query.risk_category;
    }

    const [records, total] = await Promise.all([
      LoanAnalysis.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LoanAnalysis.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAnalysisById = async (req, res, next) => {
  try {
    const dbStatus = getDatabaseStatus();

    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: "Database is not connected"
      });
    }

    const record = await LoanAnalysis.findById(req.params.id).lean();

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Analysis record not found"
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

const deleteAnalysis = async (req, res, next) => {
  try {
    const dbStatus = getDatabaseStatus();

    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: "Database is not connected"
      });
    }

    const record = await LoanAnalysis.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Analysis record not found"
      });
    }

    res.json({
      success: true,
      message: "Analysis deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

const getReport = async (req, res, next) => {
  try {
    const dbStatus = getDatabaseStatus();

    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: "Database is not connected"
      });
    }

    const record = await LoanAnalysis.findById(req.params.id).lean();

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Analysis record not found"
      });
    }

    const format = req.query.format || "json";

    if (format === "csv") {
      const headers = [
        "ID", "Date", "Age", "Monthly_Income", "Credit_Score", "Employment_Years",
        "Loan_Amount", "Loan_Tenure_Months", "Existing_Loans", "Existing_EMI",
        "Monthly_Expenses", "Previous_Defaults", "Prediction", "Risk_Category",
        "Approval_Probability"
      ];

      const row = [
        record._id,
        record.created_at,
        record.inputs.Age,
        record.inputs.Monthly_Income,
        record.inputs.Credit_Score,
        record.inputs.Employment_Years,
        record.inputs.Loan_Amount,
        record.inputs.Loan_Tenure_Months,
        record.inputs.Existing_Loans,
        record.inputs.Existing_EMI,
        record.inputs.Monthly_Expenses,
        record.inputs.Previous_Defaults,
        record.prediction.label,
        record.prediction.risk_category,
        record.prediction.approval_probability
      ];

      const csv = headers.join(",") + "\n" + row.join(",");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=loan_analysis_${record._id}.csv`);
      return res.send(csv);
    }

    const report = {
      report_title: "LoanWise AI - Loan Analysis Report",
      generated_at: new Date().toISOString(),
      analysis: record,
      disclaimer: "This report is generated by LoanWise AI, an educational decision-support tool. All predictions are estimates from a Decision Tree model and do not represent actual bank decisions or financial advice."
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=loan_analysis_${record._id}.json`);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  predict,
  compareScenarios,
  calculateEmiEndpoint,
  getHistory,
  getAnalysisById,
  deleteAnalysis,
  getReport
};
