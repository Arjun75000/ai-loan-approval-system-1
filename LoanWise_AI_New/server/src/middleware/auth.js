const jwt = require("jsonwebtoken");
const config = require("../config/environment");
const User = require("../models/User");
const { getDatabaseStatus } = require("../config/database");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Access denied. Authentication token is required."
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token. Please log in again."
      });
    }

    const dbStatus = getDatabaseStatus();
    if (dbStatus.connected) {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "User account not found."
        });
      }
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: "Account has been deactivated. Please contact support."
        });
      }
      req.user = user;
    } else {
      req.user = decoded;
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Authentication service error."
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const dbStatus = getDatabaseStatus();
        if (dbStatus.connected) {
          const user = await User.findById(decoded.id);
          if (user && user.isActive) {
            req.user = user;
          }
        } else {
          req.user = decoded;
        }
      } catch (e) {
      }
    }
    next();
  } catch (error) {
    next();
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required."
      });
    }

    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Insufficient permissions."
      });
    }

    next();
  };
};

const requireAdmin = requireRole("admin");

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requireAdmin
};
