const mlService = require("../services/mlService");

const getStatus = (req, res) => {
  const status = mlService.getModelStatus();
  const datasetInfo = mlService.getDatasetValidation();

  res.json({
    success: true,
    model: status,
    dataset: datasetInfo
  });
};

const getMetrics = (req, res) => {
  const metrics = mlService.getMetrics();

  if (!metrics) {
    return res.json({
      success: true,
      metrics: null,
      message: "No metrics available. Train the model first."
    });
  }

  res.json({
    success: true,
    metrics
  });
};

const getFeatureImportance = (req, res) => {
  const featureImportance = mlService.getFeatureImportance();

  if (!featureImportance) {
    return res.json({
      success: true,
      feature_importance: null,
      message: "No feature importance data available. Train the model first."
    });
  }

  res.json({
    success: true,
    feature_importance: featureImportance
  });
};

const getEvaluationReport = (req, res) => {
  const report = mlService.getEvaluationReport();

  if (!report) {
    return res.json({
      success: true,
      report: null,
      message: "No evaluation report available. Train the model first."
    });
  }

  res.json({
    success: true,
    report
  });
};

const getDatasetHealth = (req, res) => {
  const datasetInfo = mlService.getDatasetValidation();
  const modelStatus = mlService.getModelStatus();
  const metrics = mlService.getMetrics();

  res.json({
    success: true,
    dataset: datasetInfo,
    model: {
      trained: modelStatus.trained,
      training_timestamp: modelStatus.training_timestamp || null,
      model_version: modelStatus.model_version || null,
      demo_mode: modelStatus.demo_mode || false,
      error: modelStatus.error || null
    },
    metrics: metrics ? {
      accuracy: metrics.test_metrics?.accuracy,
      f1_score: metrics.test_metrics?.f1_score,
      roc_auc: metrics.test_metrics?.roc_auc
    } : null
  });
};

module.exports = { getStatus, getMetrics, getFeatureImportance, getEvaluationReport, getDatasetHealth };
