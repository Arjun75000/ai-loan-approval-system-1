const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  const response = {
    success: false,
    error: message
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  console.error(`[Error] ${statusCode} - ${message}`);

  res.status(statusCode).json(response);
};

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };
