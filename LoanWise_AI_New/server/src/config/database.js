const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const config = require("./environment");

let isConnected = false;
let connectionError = null;
let memoryServer = null;

const connectDatabase = async () => {
  const tryConnect = async (uri, timeout = 4000) => {
    return mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeout,
      socketTimeoutMS: 45000
    });
  };

  try {
    await tryConnect(config.mongoUri, 3500);
    isConnected = true;
    connectionError = null;
    return;
  } catch (err) {
    connectionError = err.message;
  }

  if (config.mongoUri.includes("localhost")) {
    const ipv4Uri = config.mongoUri.replace("localhost", "127.0.0.1");
    try {
      await tryConnect(ipv4Uri, 2500);
      isConnected = true;
      connectionError = null;
      return;
    } catch (err) {
      connectionError = err.message;
    }
  }

  try {
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: "loanwise_ai"
      }
    });
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    isConnected = true;
    connectionError = null;
  } catch (memErr) {
    isConnected = false;
    connectionError = memErr.message;
  }
};

mongoose.connection.on("connected", () => {
  isConnected = true;
  connectionError = null;
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
});

mongoose.connection.on("error", (err) => {
  connectionError = err.message;
});

const getDatabaseStatus = () => {
  const isReady = mongoose.connection.readyState === 1;
  return {
    connected: isReady,
    error: isReady ? null : connectionError,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || (memoryServer ? "127.0.0.1" : null),
    isEmbedded: !!memoryServer
  };
};

const closeDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
  isConnected = false;
};

module.exports = { connectDatabase, getDatabaseStatus, closeDatabase };
