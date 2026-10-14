const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

const serverEnv = path.join(__dirname, "..", "..", ".env");
const rootEnv = path.join(__dirname, "..", "..", "..", ".env");

if (fs.existsSync(serverEnv)) {
  dotenv.config({ path: serverEnv });
}
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
}

const defaultPythonPath = "C:\\Users\\91750\\AppData\\Local\\Programs\\Python\\Python312\\python.exe";
const resolvedPython = process.env.PYTHON_PATH || (fs.existsSync(defaultPythonPath) ? defaultPythonPath : "python");

const candidateMl1 = path.join(__dirname, "..", "..", "..", "ml");
const candidateMl2 = path.join(__dirname, "..", "..", "ml");
const resolvedMlDir = fs.existsSync(candidateMl1) ? candidateMl1 : candidateMl2;

const config = {
  port: parseInt(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/loanwise_ai",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  pythonPath: resolvedPython,
  mlDir: resolvedMlDir,
  predictionTimeout: parseInt(process.env.PREDICTION_TIMEOUT) || 30000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "loanwise_ai_secure_jwt_token_secret_key_2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  adminEmail: process.env.ADMIN_EMAIL || "admin@loanwise.ai",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin@LoanWise2026!",
  adminName: process.env.ADMIN_NAME || "System Administrator"
};

module.exports = config;
