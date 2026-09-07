const authService = require('../services/auth.service');

class AuthController {
    async register(req, res, next) {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password || password.length < 6) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input data' } });
            }
            const user = await authService.register(name, email.toLowerCase(), password);
            res.status(201).json({ success: true, data: { user } });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password required' } });
            }
            const user = await authService.login(email.toLowerCase(), password);
            
            req.session.userId = user.id;
            req.session.role = user.role;
            
            res.json({ success: true, data: { user } });
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        req.session.destroy((err) => {
            if (err) return next(err);
            res.clearCookie('mediaflow_session');
            res.json({ success: true, message: 'Logged out successfully' });
        });
    }

    async session(req, res, next) {
        if (req.session && req.session.userId) {
            const pool = require('../config/database');
            const [users] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.session.userId]);
            if (users.length > 0) {
                return res.json({ success: true, data: { user: users[0], authenticated: true } });
            }
        }
        res.json({ success: true, data: { authenticated: false } });
    }

    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword || newPassword.length < 6) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } });
            }
            await authService.changePassword(req.user.id, currentPassword, newPassword);
            res.json({ success: true, message: 'Password changed successfully' });
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email required' } });
            
            const token = await authService.forgotPassword(email.toLowerCase());
            
            let msg = 'If the email is registered, a reset link will be sent.';
            let devToken = undefined;
            if (token && process.env.NODE_ENV === 'development') {
                const link = `http://localhost:${process.env.PORT || 5005}/reset-password.html?token=${token}`;
                console.log(`\n[DEVELOPMENT] Password Reset Link: ${link}\n`);
                devToken = token; // Expose for e2e testing
            }
            
            res.json({ success: true, message: msg, token: devToken });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword || newPassword.length < 6) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid token or password' } });
            }
            
            await authService.resetPassword(token, newPassword);
            res.json({ success: true, message: 'Password reset successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
