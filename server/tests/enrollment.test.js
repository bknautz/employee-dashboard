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

describe('Enrollment logic', () => {
  test.todo('enroll: creates an enrollment with status not_started and progressPercent 0');
  test.todo('enroll: rejects enrolling in a course that does not exist');
  test.todo('enroll: rejects a duplicate (user, course) enrollment');
  test.todo('GET /me: only returns the requesting user\'s own enrollments');
  test.todo('PATCH /:id/progress: updates progressPercent and sets status to in_progress');
  test.todo('PATCH /:id/progress: rejects a user who is not the owner and not a manager/admin');
  test.todo('PATCH /:id/progress: a manager can update an enrollment they do not own');
  test.todo('POST /:id/complete: sets status completed, progressPercent 100, and completedAt');
  test.todo('POST /:id/complete: rejects completing an already-completed enrollment');
  test.todo('PATCH /:id/progress: rejects updating progress once status is completed');
});
