const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const User = require('../models/User');
const { connect, clearDatabase, closeDatabase } = require('./testDb');

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('Auth flow', () => {
  test('register: hashes the password and returns access + refresh tokens', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpass123',
      role: 'employee',
    });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.refreshToken).toEqual(expect.any(String));
    expect(res.body.user.role).toBe('employee');

    const userInDb = await User.findOne({ email: 'test@example.com' });
    expect(userInDb.password).not.toBe('testpass123');

    const passwordMatches = await bcrypt.compare('testpass123', userInDb.password);
    expect(passwordMatches).toBe(true);
  });
  
  test('register: rejects a duplicate email', async () =>{
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpass123',
      role: 'employee',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpass123',
      role: 'admin',
    });
    
    expect(res.status).toBe(400);

    const userInDb = await User.findOne({ email: 'test@example.com' });
    expect(userInDb.role).toBe('employee');

  });
  test('login: signs in correctly and mints access and refresh token', async () =>{
     await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpass123',
      role: 'employee',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'testpass123',
    });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.refreshToken).toEqual(expect.any(String));

  });
  test('login: returns the same 401 for wrong password and unknown email', async () =>{
     await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpass123',
      role: 'employee',
    });

    const resPass = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'test123',
    });
    expect(resPass.status).toBe(401);


    const resEmail = await request(app).post('/api/auth/login').send({
      email: 'notanemail',
      password: 'test123',
    });

    expect(resEmail.status).toBe(401);
    expect(resEmail.status).toBe(resPass.status);
   

  });
  test.todo('requireAuth: rejects a request with no Authorization header');
  test.todo('requireAuth: rejects an expired or malformed token');
  test.todo('requireAuth: attaches req.user and allows the request through on a valid token');
  test.todo('requireRole: rejects a role not in the allowed list with 403');
  test.todo('POST /refresh: issues a new access token for a valid refresh token');
  test.todo('POST /refresh: rejects a missing, garbage, or expired refresh token');
});
