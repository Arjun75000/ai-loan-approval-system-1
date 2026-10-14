const express = require("express");
const { getStatus, getMetrics, getFeatureImportance, getEvaluationReport, getDatasetHealth } = require("../controllers/mlController");

const router = express.Router();

router.get("/status", getStatus);
router.get("/metrics", getMetrics);
router.get("/feature-importance", getFeatureImportance);
router.get("/evaluation", getEvaluationReport);
router.get("/dataset-health", getDatasetHealth);

module.exports = router;
