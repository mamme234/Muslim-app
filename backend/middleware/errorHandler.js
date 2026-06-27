// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

class AppError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { errorHandler, AppError };
