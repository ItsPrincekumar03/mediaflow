const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    let statusCode = err.statusCode || 500;
    let code = err.code || 'INTERNAL_SERVER_ERROR';
    let message = err.message || 'Internal Server Error';

    if (err.name === 'ValidationError') {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
    }

    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'Internal Server Error' : message
        }
    });
};

module.exports = errorHandler;
