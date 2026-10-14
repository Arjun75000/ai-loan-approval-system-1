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
const candidateMl3 = path.join(__dirname, "..", "..", "..", "LoanWise_AI_New", "ml");
const resolvedMlDir = fs.existsSync(candidateMl1) ? candidateMl1 : (fs.existsSync(candidateMl2) ? candidateMl2 : candidateMl3);

const config = {
  port: parseInt(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/loanwise_ai",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  pythonPath: resolvedPython,
  mlDir: resolvedMlDir,
  predictionTimeout: parseInt(process.env.PREDICTION_TIMEOUT) || 30000,
  nodeEnv: process.env.NODE_ENV || "development"
};

module.exports = config;
