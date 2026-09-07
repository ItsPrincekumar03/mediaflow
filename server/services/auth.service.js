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
    async forgotPassword(email) {
        const [users] = await pool.query('SELECT id FROM users WHERE email = ? AND status = "active"', [email]);
        if (users.length === 0) return null; // Do not reveal if email exists or not securely
        
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = await bcrypt.hash(token, 10);
        
        const expiry = new Date(Date.now() + 3600000); // 1 hour expiry
        await pool.query('UPDATE users SET reset_token_hash = ?, reset_token_expiry = ? WHERE id = ?', [tokenHash, expiry, users[0].id]);
        
        return token;
    }

    async resetPassword(token, newPassword) {
        const [users] = await pool.query('SELECT id, reset_token_hash, reset_token_expiry FROM users WHERE reset_token_hash IS NOT NULL AND reset_token_expiry > NOW()');
        
        let validUser = null;
        for (const user of users) {
            const isValid = await bcrypt.compare(token, user.reset_token_hash);
            if (isValid) {
                validUser = user;
                break;
            }
        }
        
        if (!validUser) {
            const error = new Error('Invalid or expired reset token');
            error.statusCode = 400;
            error.code = 'INVALID_TOKEN';
            throw error;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_token_expiry = NULL WHERE id = ?', [hashedPassword, validUser.id]);
    }
}

module.exports = new AuthService();
