const fs = require("fs");
const path = require("path");
const config = require("../config/environment");
const { runPythonScript } = require("../utils/pythonRunner");

const getModelStatus = () => {
  const statusPath = path.join(config.mlDir, "model", "model_status.json");
  const modelPath = path.join(config.mlDir, "model", "decision_tree_model.joblib");
  const scalerPath = path.join(config.mlDir, "model", "scaler.joblib");

  if (!fs.existsSync(modelPath) || !fs.existsSync(scalerPath)) {
    return {
      trained: false,
      error: "Model files not found. Please train the model first.",
      demo_mode: true
    };
  }

  if (fs.existsSync(statusPath)) {
    try {
      const status = JSON.parse(fs.readFileSync(statusPath, "utf8"));
      return { ...status, demo_mode: false };
    } catch (e) {
      return {
        trained: false,
        error: "Could not read model status file.",
        demo_mode: true
      };
    }
  }

  return {
    trained: true,
    demo_mode: false,
    training_timestamp: "Unknown"
  };
};

const getMetrics = () => {
  const metricsPath = path.join(config.mlDir, "reports", "metrics.json");

  if (!fs.existsSync(metricsPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(metricsPath, "utf8"));
  } catch (e) {
    return null;
  }
};

const getFeatureImportance = () => {
  const fiPath = path.join(config.mlDir, "reports", "feature_importance.json");

  if (!fs.existsSync(fiPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(fiPath, "utf8"));
  } catch (e) {
    return null;
  }
};

const getEvaluationReport = () => {
  const reportPath = path.join(config.mlDir, "reports", "evaluation_report.json");

  if (!fs.existsSync(reportPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(reportPath, "utf8"));
  } catch (e) {
    return null;
  }
};

const getDatasetValidation = () => {
  const validationPath = path.join(config.mlDir, "reports", "dataset_validation.json");
  const datasetPath = path.join(config.mlDir, "data", "loan_dataset.csv");

  const result = {
    dataset_available: fs.existsSync(datasetPath),
    validation: null
  };

  if (fs.existsSync(validationPath)) {
    try {
      result.validation = JSON.parse(fs.readFileSync(validationPath, "utf8"));
    } catch (e) {
      result.validation = null;
    }
  }

  return result;
};

const runPrediction = async (inputData) => {
  const status = getModelStatus();

  if (!status.trained) {
    return {
      success: false,
      error: status.error || "Model is not trained. Please train the model first.",
      demo_mode: true
    };
  }

  try {
    const result = await runPythonScript("predict.py", inputData);
    return result;
  } catch (error) {
    return {
      success: false,
      error: `Prediction failed: ${error.message}`
    };
  }
};

const runBatchPrediction = async (inputsList) => {
  const status = getModelStatus();

  if (!status.trained) {
    return {
      success: false,
      error: status.error || "Model is not trained.",
      demo_mode: true
    };
  }

  try {
    const result = await runPythonScript("predict.py", inputsList);
    return result;
  } catch (error) {
    return {
      success: false,
      error: `Batch prediction failed: ${error.message}`
    };
  }
};

module.exports = {
  getModelStatus,
  getMetrics,
  getFeatureImportance,
  getEvaluationReport,
  getDatasetValidation,
  runPrediction,
  runBatchPrediction
};
