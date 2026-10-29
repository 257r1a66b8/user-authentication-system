import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js';
import User from '../models/User.js';

let mongoServer;

describe('Authentication & User Management API Tests', () => {
  before(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_jwt_secret_key_minimum_32_characters_for_testing_12345';
    process.env.COOKIE_NAME = 'auth_token';

    // Spin up an isolated, transient in-memory MongoDB instance for safe testing
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    // Clean all user documents between individual tests for isolation
    await User.deleteMany({});
  });

  // 1. Health check endpoint test
  it('GET /api/health should return ok status and database status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.database, 'connected');
  });

  // 2. Successful Registration test
  it('POST /api/auth/register should successfully register a new user and return Set-Cookie', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'SecurePassword123!'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.name, 'John Doe');
    assert.equal(res.body.user.email, 'john.doe@example.com');
    assert.equal(res.body.user.role, 'user');
    // Ensure password hash is NEVER exposed in the JSON response
    assert.equal(res.body.user.password, undefined);

    // Verify HttpOnly cookie was set
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies, 'Cookie header should be present');
    assert.ok(cookies.some(c => c.includes('auth_token=')), 'auth_token cookie should be set');
    assert.ok(cookies.some(c => c.includes('HttpOnly')), 'Cookie must have HttpOnly flag');
  });

  // 3. Password Hashing Verification
  it('Registration must hash passwords with bcrypt in the database (no plaintext)', async () => {
    const rawPassword = 'SecurePassword123!';
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: rawPassword
      });

    const storedUser = await User.findOne({ email: 'jane.doe@example.com' }).select('+password');
    assert.ok(storedUser);
    assert.notEqual(storedUser.password, rawPassword, 'Stored password must not match plaintext');
    assert.ok(storedUser.password.startsWith('$2a$') || storedUser.password.startsWith('$2b$'), 'Password must be a bcrypt hash');
  });

  // 4. Duplicate Email Rejection
  it('POST /api/auth/register should reject duplicate email registrations with HTTP 409', async () => {
    const userData = {
      name: 'Duplicate User',
      email: 'duplicate@example.com',
      password: 'Password123!'
    };

    // First registration
    const res1 = await request(app).post('/api/auth/register').send(userData);
    assert.equal(res1.status, 201);

    // Second registration with same email (even with different casing)
    const res2 = await request(app).post('/api/auth/register').send({
      ...userData,
      email: 'DUPLICATE@example.com'
    });
    assert.equal(res2.status, 409);
    assert.equal(res2.body.success, false);
    assert.match(res2.body.message, /already exists|already registered/i);
  });

  // 5. Registration Validation Rejection
  it('POST /api/auth/register should reject invalid registration payloads with HTTP 400', async () => {
    // Missing fields
    const res1 = await request(app).post('/api/auth/register').send({ email: 'bad@test.com' });
    assert.equal(res1.status, 400);

    // Invalid email format
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'Bad Email',
      email: 'not-an-email',
      password: 'Password123!'
    });
    assert.equal(res2.status, 400);

    // Short password (< 8 chars)
    const res3 = await request(app).post('/api/auth/register').send({
      name: 'Short Pwd',
      email: 'short@test.com',
      password: '123'
    });
    assert.equal(res3.status, 400);
  });

  // 6. Successful Login
  it('POST /api/auth/login should authenticate valid credentials and issue cookie', async () => {
    await User.create({
      name: 'Login User',
      email: 'login@example.com',
      password: 'ValidPassword123!'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'ValidPassword123!'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.email, 'login@example.com');
    assert.equal(res.body.user.password, undefined);

    const cookies = res.headers['set-cookie'];
    assert.ok(cookies);
    assert.ok(cookies.some(c => c.includes('auth_token=') && c.includes('HttpOnly')));
  });

  // 7. Rejection of Incorrect Login Credentials
  it('POST /api/auth/login should reject incorrect credentials with generic HTTP 401', async () => {
    await User.create({
      name: 'Login User',
      email: 'login@example.com',
      password: 'ValidPassword123!'
    });

    // Wrong password
    const res1 = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'WrongPassword999!'
    });
    assert.equal(res1.status, 401);
    assert.equal(res1.body.message, 'Invalid email or password.');

    // Non-existent email
    const res2 = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'ValidPassword123!'
    });
    assert.equal(res2.status, 401);
    assert.equal(res2.body.message, 'Invalid email or password.');
  });

  // 8. Protected Endpoint Access Control
  it('GET /api/auth/me should reject requests without authentication cookie (HTTP 401)', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('GET /api/auth/me should return authenticated profile when valid cookie is provided', async () => {
    // 1. Register to obtain cookie
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Cookie User',
        email: 'cookie.user@example.com',
        password: 'Password123!'
      });

    const authCookie = regRes.headers['set-cookie'];

    // 2. Request /api/auth/me using the obtained cookie
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', authCookie);

    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.success, true);
    assert.equal(meRes.body.user.email, 'cookie.user@example.com');
  });

  // 9. Successful Logout
  it('POST /api/auth/logout should clear the session cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const cookies = res.headers['set-cookie'];
    assert.ok(cookies);
    // Express clearCookie sets the cookie with expires in the past or empty value
    assert.ok(cookies.some(c => c.includes('auth_token=;') || c.includes('Expires=Thu, 01 Jan 1970')));
  });

  // 10. Profile Update & Role Protection
  it('PATCH /api/users/profile should allow updating name and block unauthorized role changes', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Original Name',
        email: 'profile.test@example.com',
        password: 'Password123!'
      });
    const authCookie = regRes.headers['set-cookie'];

    // Attempt privilege escalation to admin
    const maliciousRes = await request(app)
      .patch('/api/users/profile')
      .set('Cookie', authCookie)
      .send({ role: 'admin' });

    assert.equal(maliciousRes.status, 403);

    // Legitimate name update
    const validRes = await request(app)
      .patch('/api/users/profile')
      .set('Cookie', authCookie)
      .send({ name: 'Updated Name' });

    assert.equal(validRes.status, 200);
    assert.equal(validRes.body.user.name, 'Updated Name');
    assert.equal(validRes.body.user.role, 'user'); // Role must remain user
  });

  // 11. Password Change Verification
  it('POST /api/auth/change-password should verify current password and hash new password', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Pwd User',
        email: 'pwd.user@example.com',
        password: 'InitialPassword123!'
      });
    const authCookie = regRes.headers['set-cookie'];

    // Attempt with incorrect current password
    const wrongCurrentRes = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', authCookie)
      .send({
        currentPassword: 'WrongCurrentPassword!',
        newPassword: 'BrandNewPassword123!'
      });
    assert.equal(wrongCurrentRes.status, 401);

    // Attempt with valid current password
    const successRes = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', authCookie)
      .send({
        currentPassword: 'InitialPassword123!',
        newPassword: 'BrandNewPassword123!'
      });
    assert.equal(successRes.status, 200);
    assert.equal(successRes.body.success, true);

    // Verify login with new password succeeds
    const newLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'pwd.user@example.com',
        password: 'BrandNewPassword123!'
      });
    assert.equal(newLoginRes.status, 200);
  });
});
