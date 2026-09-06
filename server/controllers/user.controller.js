const userService = require('../services/user.service');

class UserController {
    async getMe(req, res, next) {
        try {
            const user = await userService.getProfile(req.user.id);
            res.json({ success: true, data: { user } });
        } catch (error) {
            next(error);
        }
    }

    async updateMe(req, res, next) {
        try {
            const { name } = req.body;
            if (!name || typeof name !== 'string' || name.trim() === '') {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name is required' } });
            }
            const user = await userService.updateProfile(req.user.id, { name: name.trim() });
            res.json({ success: true, data: { user } });
        } catch (error) {
            next(error);
        }
    }

    async deleteMe(req, res, next) {
        try {
            await userService.deleteAccount(req.user.id);
            req.session.destroy((err) => {
                if (err) return next(err);
                res.clearCookie('mediaflow_session');
                res.json({ success: true, message: 'Account deleted successfully' });
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
