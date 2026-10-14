const express = require("express");
const {
  getAdminStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  getAllAnalyses
} = require("../controllers/adminController");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { validateObjectId } = require("../middleware/validateRequest");

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getUsers);
router.put("/users/:id/status", validateObjectId, updateUserStatus);
router.delete("/users/:id", validateObjectId, deleteUser);
router.get("/analyses", getAllAnalyses);

module.exports = router;
