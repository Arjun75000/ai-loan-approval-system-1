const mongoose = require("mongoose");
const config = require("./environment");

let isConnected = false;
let connectionError = null;

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    isConnected = true;
    connectionError = null;
    console.log("MongoDB connected successfully");
  } catch (error) {
    isConnected = false;
    connectionError = error.message;
    console.error("MongoDB connection failed:", error.message);
    console.error("The application will continue but database features will be unavailable.");
  }
};

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  connectionError = err.message;
  console.error("MongoDB error:", err.message);
});

const getDatabaseStatus = () => ({
  connected: isConnected,
  error: connectionError,
  readyState: mongoose.connection.readyState
});

module.exports = { connectDatabase, getDatabaseStatus };
