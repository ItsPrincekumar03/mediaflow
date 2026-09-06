const pool = require('../config/database');

class UserService {
    async getProfile(userId) {
        const [users] = await pool.query('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?', [userId]);
        if (users.length === 0) throw new Error('User not found');
        return users[0];
    }

    async updateProfile(userId, data) {
        const { name } = data;
        if (name) {
            await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
        }
        return this.getProfile(userId);
    }

    async deleteAccount(userId) {
        await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    }
}

module.exports = new UserService();
