const express = require("express");
const {
  predict, compareScenarios, calculateEmiEndpoint,
  getHistory, getAnalysisById, deleteAnalysis, getReport
} = require("../controllers/loanController");
const { validateLoanInput, validateEmiInput, validateObjectId } = require("../middleware/validateRequest");

const router = express.Router();

router.post("/predict", validateLoanInput, predict);
router.post("/compare", compareScenarios);
router.post("/calculate-emi", validateEmiInput, calculateEmiEndpoint);
router.get("/history", getHistory);
router.get("/:id", validateObjectId, getAnalysisById);
router.delete("/:id", validateObjectId, deleteAnalysis);

module.exports = router;
