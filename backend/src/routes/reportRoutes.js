const express = require("express");
const { validateObjectId } = require("../middleware/validateRequest");
const { getReport } = require("../controllers/loanController");

const router = express.Router();

router.get("/:id", validateObjectId, getReport);

module.exports = router;
