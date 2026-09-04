const request = require('supertest');
const app = require('../app');
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
  test.todo('register: hashes the password and returns access + refresh tokens');
  test.todo('register: rejects a duplicate email');
  test.todo('login: returns the same 401 for wrong password and unknown email');
  test.todo('requireAuth: rejects a request with no Authorization header');
  test.todo('requireAuth: rejects an expired or malformed token');
  test.todo('requireAuth: attaches req.user and allows the request through on a valid token');
  test.todo('requireRole: rejects a role not in the allowed list with 403');
  test.todo('POST /refresh: issues a new access token for a valid refresh token');
  test.todo('POST /refresh: rejects a missing, garbage, or expired refresh token');
});
