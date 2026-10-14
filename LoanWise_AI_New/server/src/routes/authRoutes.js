const express = require("express");
const {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
