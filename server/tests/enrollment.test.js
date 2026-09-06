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

let userCounter = 0;
async function registerUser(role = 'employee') {
  userCounter += 1;
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: `user${userCounter}-${role}@example.com`,
    password: 'testpass123',
    role,
  });
  return { accessToken: res.body.accessToken, userId: res.body.user.id };
}

let courseCounter = 0;
async function createTestCourse(adminToken) {
  courseCounter += 1;
  const res = await request(app)
    .post('/api/courses')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: `Test Course ${courseCounter}`,
      provider: 'AWS',
      description: 'test course',
      hours: 5,
      expirationMonths: 12,
    });
  return res.body.course.id;
}

describe('Enrollment logic', () => {
  test('enroll: creates an enrollment with status not_started and progressPercent 0', async () => {
    const admin = await registerUser('admin');
    const employee = await registerUser('employee');
    const courseId = await createTestCourse(admin.accessToken);

    const res = await request(app)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${employee.accessToken}`)
      .send({ course: courseId });

    expect(res.status).toBe(201);
    expect(res.body.enrollment.status).toBe('not_started');
    expect(res.body.enrollment.progressPercent).toBe(0);
    expect(res.body.enrollment.course).toBe(courseId);
  });

  test('enroll: rejects enrolling in a course that does not exist', async () => {
    const employee = await registerUser('employee');
    const fakeCourseId = '000000000000000000000000';

    const res = await request(app)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${employee.accessToken}`)
      .send({ course: fakeCourseId });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Course not found');
  });

  test('enroll: rejects a duplicate (user, course) enrollment', async () => {
    const admin = await registerUser('admin');
    const employee = await registerUser('employee');
    const courseId = await createTestCourse(admin.accessToken);

    await request(app)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${employee.accessToken}`)
      .send({ course: courseId });

    const res = await request(app)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${employee.accessToken}`)
      .send({ course: courseId });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Already enrolled in this course');
  });

  test("GET /me: only returns the requesting user's own enrollments", async () => {
    const admin = await registerUser('admin');
    const employeeA = await registerUser('employee');
    const employeeB = await registerUser('employee');
    const courseId = await createTestCourse(admin.accessToken);

    await request(app)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${employeeA.accessToken}`)
      .send({ course: courseId });

    await request(app)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${employeeB.accessToken}`)
      .send({ course: courseId });

    const res = await request(app)
      .get('/api/enrollments/me')
      .set('Authorization', `Bearer ${employeeA.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(1);
    expect(res.body.results[0].user).toBe(employeeA.userId);
  });

  test('PATCH /:id/progress: updates progressPercent and sets status to in_progress', async () => {
    const admin = await registerUser('admin');
    const employee = await registerUser('employee');
    const courseId = await createTestCourse(admin.accessToken);

    const enrollRes = await request(app)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${employee.accessToken}`)
      .send({ course: courseId });
    const enrollmentId = enrollRes.body.enrollment.id;

    const res = await request(app)
      .patch(`/api/enrollments/${enrollmentId}/progress`)
      .set('Authorization', `Bearer ${employee.accessToken}`)
      .send({ progressPercent: 50 });

    expect(res.status).toBe(200);
    expect(res.body.enrollment.progressPercent).toBe(50);
    expect(res.body.enrollment.status).toBe('in_progress');
  });

  test('PATCH /:id/progress: rejects a user who is not the owner and not a manager/admin', async () => {
    const admin = await registerUser('admin');
    const owner = await registerUser('employee');
    const otherEmployee = await registerUser('employee');
    const courseId = await createTestCourse(admin.accessToken);

    const enrollRes = await request(app)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ course: courseId });
    const enrollmentId = enrollRes.body.enrollment.id;

    const res = await request(app)
      .patch(`/api/enrollments/${enrollmentId}/progress`)
      .set('Authorization', `Bearer ${otherEmployee.accessToken}`)
      .send({ progressPercent: 50 });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Insufficient permissions');
  });

  test('PATCH /:id/progress: a manager can update an enrollment they do not own', async () => {
    const admin = await registerUser('admin');
    const owner = await registerUser('employee');
    const manager = await registerUser('manager');
    const courseId = await createTestCourse(admin.accessToken);

    const enrollRes = await request(app)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ course: courseId });
    const enrollmentId = enrollRes.body.enrollment.id;

    const res = await request(app)
      .patch(`/api/enrollments/${enrollmentId}/progress`)
      .set('Authorization', `Bearer ${manager.accessToken}`)
      .send({ progressPercent: 75 });

    expect(res.status).toBe(200);
    expect(res.body.enrollment.progressPercent).toBe(75);
  });

  test('POST /:id/complete: sets status completed, progressPercent 100, and completedAt', async () => {
    const admin = await registerUser('admin');
    const employee = await registerUser('employee');
    const courseId = await createTestCourse(admin.accessToken);

    const enrollRes = await request(app)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${employee.accessToken}`)
      .send({ course: courseId });
    const enrollmentId = enrollRes.body.enrollment.id;

    const res = await request(app)
      .post(`/api/enrollments/${enrollmentId}/complete`)
      .set('Authorization', `Bearer ${employee.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.enrollment.status).toBe('completed');
    expect(res.body.enrollment.progressPercent).toBe(100);
    expect(res.body.enrollment.completedAt).not.toBeNull();
  });

  test('POST /:id/complete: rejects completing an already-completed enrollment', async () => {
    const admin = await registerUser('admin');
    const employee = await registerUser('employee');
    const courseId = await createTestCourse(admin.accessToken);

    const enrollRes = await request(app)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${employee.accessToken}`)
      .send({ course: courseId });
    const enrollmentId = enrollRes.body.enrollment.id;

    await request(app)
      .post(`/api/enrollments/${enrollmentId}/complete`)
      .set('Authorization', `Bearer ${employee.accessToken}`);

    const res = await request(app)
      .post(`/api/enrollments/${enrollmentId}/complete`)
      .set('Authorization', `Bearer ${employee.accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Enrollment already completed');
  });

  test('PATCH /:id/progress: rejects updating progress once status is completed', async () => {
    const admin = await registerUser('admin');
    const employee = await registerUser('employee');
    const courseId = await createTestCourse(admin.accessToken);

    const enrollRes = await request(app)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${employee.accessToken}`)
      .send({ course: courseId });
    const enrollmentId = enrollRes.body.enrollment.id;

    await request(app)
      .post(`/api/enrollments/${enrollmentId}/complete`)
      .set('Authorization', `Bearer ${employee.accessToken}`);

    const res = await request(app)
      .patch(`/api/enrollments/${enrollmentId}/progress`)
      .set('Authorization', `Bearer ${employee.accessToken}`)
      .send({ progressPercent: 10 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Enrollment already completed');
  });

  test('PATCH /:id/progress: rejects a malformed enrollment id', async () => {
    const employee = await registerUser('employee');

    const res = await request(app)
      .patch('/api/enrollments/not-a-valid-id/progress')
      .set('Authorization', `Bearer ${employee.accessToken}`)
      .send({ progressPercent: 50 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid Enrollment ID');
  });

  test('PATCH /:id/progress: rejects a well-formed but nonexistent enrollment id', async () => {
    const employee = await registerUser('employee');

    const res = await request(app)
      .patch('/api/enrollments/000000000000000000000000/progress')
      .set('Authorization', `Bearer ${employee.accessToken}`)
      .send({ progressPercent: 50 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Enrollment Not Found');
  });

  test('POST /:id/complete: rejects a malformed enrollment id', async () => {
    const employee = await registerUser('employee');

    const res = await request(app)
      .post('/api/enrollments/not-a-valid-id/complete')
      .set('Authorization', `Bearer ${employee.accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid Enrollment ID');
  });

  test('POST /:id/complete: rejects a well-formed but nonexistent enrollment id', async () => {
    const employee = await registerUser('employee');

    const res = await request(app)
      .post('/api/enrollments/000000000000000000000000/complete')
      .set('Authorization', `Bearer ${employee.accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Enrollment Not Found');
  });
});
