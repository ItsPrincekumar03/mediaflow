const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const pool = require('./config/database');
const errorHandler = require('./middleware/error');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : false,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));

const sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000,
    createDatabaseTable: true
}, pool);

app.use(session({
    key: 'mediaflow_session',
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400000
    }
}));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'MediaFlow API is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/v1/health/detailed', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({
            success: true,
            database: 'healthy',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            database: 'unhealthy',
            timestamp: new Date().toISOString()
        });
    }
});

app.use((req, res, next) => {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

app.use(errorHandler);

module.exports = app;
