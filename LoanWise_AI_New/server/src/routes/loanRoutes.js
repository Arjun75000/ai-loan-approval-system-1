const express = require("express");
const {
  predict,
  compareScenarios,
  calculateEmiEndpoint,
  getHistory,
  getUserDashboardStats,
  getAnalysisById,
  deleteAnalysis
} = require("../controllers/loanController");
const { validateLoanInput, validateEmiInput, validateObjectId } = require("../middleware/validateRequest");
const { authenticate, optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/predict", optionalAuth, validateLoanInput, predict);
router.post("/compare", compareScenarios);
router.post("/calculate-emi", validateEmiInput, calculateEmiEndpoint);
router.get("/user-stats", authenticate, getUserDashboardStats);
router.get("/history", optionalAuth, getHistory);
router.get("/:id", optionalAuth, validateObjectId, getAnalysisById);
router.delete("/:id", optionalAuth, validateObjectId, deleteAnalysis);

module.exports = router;
