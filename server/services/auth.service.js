const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class AuthService {
    async register(name, email, password) {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            const error = new Error('Email already registered');
            error.statusCode = 400;
            error.code = 'DUPLICATE_EMAIL';
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query(
                'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
                [name, email, hashedPassword]
            );
            const userId = result.insertId;

            await connection.query(
                'INSERT INTO user_settings (user_id, preferences) VALUES (?, ?)',
                [userId, JSON.stringify({})]
            );

            await connection.commit();
            return { id: userId, name, email, role: 'user' };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async login(email, password) {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND status = "active"', [email]);
        if (users.length === 0) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }

        const user = users[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }

        return { id: user.id, name: user.name, email: user.email, role: user.role };
    }

    async changePassword(userId, currentPassword, newPassword) {
        const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (users.length === 0) throw new Error('User not found');

        const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!isValid) {
            const error = new Error('Invalid current password');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);
    }
}

module.exports = new AuthService();
