require('dotenv').config();
const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 5000;

let server;

async function startServer() {
    try {
        await pool.query('SELECT 1');
        console.log('Database connected successfully');
        
        server = app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    if (server) {
        server.close(() => {
            console.log('HTTP server closed');
            pool.end().then(() => {
                console.log('Database connection pool closed');
                process.exit(0);
            });
        });
    }
});
