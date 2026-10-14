const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const config = require("./config/environment");
const { connectDatabase } = require("./config/database");
const { errorHandler } = require("./middleware/errorHandler");
const { seedAdminUser } = require("./utils/seedAdmin");
const healthRoutes = require("./routes/healthRoutes");
const mlRoutes = require("./routes/mlRoutes");
const loanRoutes = require("./routes/loanRoutes");
const reportRoutes = require("./routes/reportRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "1mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, error: "Too many requests. Please try again later." }
});
app.use(limiter);

app.use("/api/health", healthRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

app.use(errorHandler);

const startServer = async () => {
  await connectDatabase();
  await seedAdminUser();

  app.listen(config.port, () => {
    console.log(`LoanWise AI Server running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
};

startServer();
