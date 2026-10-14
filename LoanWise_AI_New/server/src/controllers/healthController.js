const { getDatabaseStatus } = require("../config/database");
const mlService = require("../services/mlService");

const getHealth = (req, res) => {
  const dbStatus = getDatabaseStatus();
  const modelStatus = mlService.getModelStatus();

  res.json({
    success: true,
    status: "running",
    timestamp: new Date().toISOString(),
    services: {
      server: "healthy",
      database: dbStatus.connected ? "connected" : "disconnected",
      ml_model: modelStatus.trained ? "ready" : "not_trained"
    }
  });
};

module.exports = { getHealth };
