const crypto = require("crypto");
const User = require("../models/User");
const { getDatabaseStatus } = require("../config/database");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long."
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid email address."
      });
    }

    const dbStatus = getDatabaseStatus();
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: "Database is unavailable. User registration cannot be completed at this time."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "An account with this email address already exists."
      });
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "user"
    });

    await user.save();
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required."
      });
    }

    const dbStatus = getDatabaseStatus();
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: "Database is unavailable. Login cannot be completed."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password."
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "Your account has been deactivated. Please contact an administrator."
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password."
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = user.generateAuthToken();

    res.json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Admin email and password are required."
      });
    }

    const dbStatus = getDatabaseStatus();
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: "Database is unavailable. Admin login cannot be completed."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid admin credentials."
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Administrator privileges required."
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "Admin account is deactivated."
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid admin credentials."
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = user.generateAuthToken();

    res.json({
      success: true,
      message: "Admin authenticated successfully.",
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user.toJSON ? req.user.toJSON() : req.user
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const dbStatus = getDatabaseStatus();

    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: "Database is unavailable."
      });
    }

    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found."
      });
    }

    if (name && name.trim().length >= 2) {
      user.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: "Current password is required to change password."
        });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: "Current password does not match."
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: "New password must be at least 6 characters long."
        });
      }
      user.password = newPassword;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required."
      });
    }

    const dbStatus = getDatabaseStatus();
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: "Database is unavailable."
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.json({
        success: true,
        message: "If an account with that email exists, password reset instructions have been generated."
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    res.json({
      success: true,
      message: "Password reset token created successfully.",
      resetToken: resetToken
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Reset token and new password are required."
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long."
      });
    }

    const dbStatus = getDatabaseStatus();
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: "Database is unavailable."
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Password reset token is invalid or has expired."
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "Password has been successfully updated. You may now log in."
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword
};
