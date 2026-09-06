require('dotenv').config();
const request = require('supertest');
const app = require('../server/app');
const pool = require('../server/config/database');

describe('Auth Endpoints', () => {
    let cookie;

    beforeAll(async () => {
        await pool.query('DELETE FROM users WHERE email = "test@mediaflow.com"');
    });

    afterAll(async () => {
        await pool.query('DELETE FROM users WHERE email = "test@mediaflow.com"');
        await pool.end();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Test User',
                email: 'test@mediaflow.com',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
    });

    it('should not register with duplicate email', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Test User 2',
                email: 'test@mediaflow.com',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
    });

    it('should login and return session cookie', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'test@mediaflow.com',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.headers['set-cookie']).toBeDefined();
        cookie = res.headers['set-cookie'];
    });

    it('should get session details', async () => {
        const res = await request(app)
            .get('/api/v1/auth/session')
            .set('Cookie', cookie);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.authenticated).toBe(true);
    });

    it('should fetch user profile', async () => {
        const res = await request(app)
            .get('/api/v1/users/me')
            .set('Cookie', cookie);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.user.email).toBe('test@mediaflow.com');
    });

    it('should logout and destroy session', async () => {
        const res = await request(app)
            .post('/api/v1/auth/logout')
            .set('Cookie', cookie);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('should not fetch user profile after logout', async () => {
        const res = await request(app)
            .get('/api/v1/users/me')
            .set('Cookie', cookie);
        expect(res.statusCode).toEqual(401);
    });
});
