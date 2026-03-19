class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // Determine status (fail for 400-499, error for 500+)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // This marks the error as "Operational", meaning it's a known 
    // business logic error, not a programming bug (like a syntax error).
    this.isOperational = true;

    // Captures the stack trace so you can see where the error happened
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;