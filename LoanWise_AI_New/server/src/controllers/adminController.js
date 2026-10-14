const User = require("../models/User");
const LoanAnalysis = require("../models/LoanAnalysis");
const mlService = require("../services/mlService");
const { getDatabaseStatus } = require("../config/database");

const getAdminStats = async (req, res, next) => {
  try {
    const dbStatus = getDatabaseStatus();
    const modelStatus = mlService.getModelStatus();
    const metrics = mlService.getMetrics();

    if (!dbStatus.connected) {
      return res.json({
        success: true,
        stats: {
          totalUsers: 0,
          activeUsers: 0,
          totalAnalyses: 0,
          approvedAnalyses: 0,
          rejectedAnalyses: 0,
          approvalRate: 0,
          riskDistribution: {},
          recentActivity: [],
          mlStatus: modelStatus,
          mlMetrics: metrics?.test_metrics || null
        }
      });
    }

    const [
      totalUsers,
      activeUsers,
      totalAnalyses,
      approvedAnalyses,
      rejectedAnalyses,
      recentActivity,
      riskCounts
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      LoanAnalysis.countDocuments(),
      LoanAnalysis.countDocuments({ "prediction.label": "Approved" }),
      LoanAnalysis.countDocuments({ "prediction.label": "Rejected" }),
      LoanAnalysis.find()
        .sort({ created_at: -1 })
        .limit(10)
        .populate("userId", "name email")
        .lean(),
      LoanAnalysis.aggregate([
        {
          $group: {
            _id: "$prediction.risk_category",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const riskDistribution = {};
    riskCounts.forEach((item) => {
      if (item._id) {
        riskDistribution[item._id] = item.count;
      }
    });

    const approvalRate = totalAnalyses > 0
      ? Number(((approvedAnalyses / totalAnalyses) * 100).toFixed(1))
      : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalAnalyses,
        approvedAnalyses,
        rejectedAnalyses,
        approvalRate,
        riskDistribution,
        recentActivity,
        mlStatus: modelStatus,
        mlMetrics: metrics?.test_metrics || null
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const dbStatus = getDatabaseStatus();
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: "Database is unavailable."
      });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }
    if (req.query.role) {
      filter.role = req.query.role;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    const sanitizedUsers = users.map((u) => {
      delete u.password;
      delete u.resetPasswordToken;
      delete u.resetPasswordExpires;
      return u;
    });

    res.json({
      success: true,
      users: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const dbStatus = getDatabaseStatus();
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: "Database is unavailable."
      });
    }

    const { id } = req.params;
    const { isActive, role } = req.body;

    if (id === req.user._id.toString() || id === req.user.id) {
      if (isActive === false) {
        return res.status(400).json({
          success: false,
          error: "You cannot deactivate your own administrator account."
        });
      }
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found."
      });
    }

    if (isActive !== undefined) {
      user.isActive = Boolean(isActive);
    }
    if (role && ["user", "admin"].includes(role)) {
      user.role = role;
    }

    await user.save();

    res.json({
      success: true,
      message: "User status updated successfully.",
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const dbStatus = getDatabaseStatus();
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: "Database is unavailable."
      });
    }

    const { id } = req.params;

    if (id === req.user._id.toString() || id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: "You cannot delete your own administrator account."
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found."
      });
    }

    await LoanAnalysis.deleteMany({ userId: id });

    res.json({
      success: true,
      message: "User and associated data deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};

const getAllAnalyses = async (req, res, next) => {
  try {
    const dbStatus = getDatabaseStatus();
    if (!dbStatus.connected) {
      return res.json({
        success: true,
        data: [],
        total: 0
      });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.prediction) {
      filter["prediction.label"] = req.query.prediction;
    }
    if (req.query.risk_category) {
      filter["prediction.risk_category"] = req.query.risk_category;
    }

    const [analyses, total] = await Promise.all([
      LoanAnalysis.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .lean(),
      LoanAnalysis.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: analyses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  getAllAnalyses
};
