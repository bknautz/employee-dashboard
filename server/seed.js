// seed.js
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User');
const Course = require('./models/Course');
const LearningPath = require('./models/LearningPath');
const Enrollment = require('./models/Enrollment');
const Team = require('./models/Team');

const ROLES = ['employee', 'employee', 'employee', 'employee', 'manager', 'admin'];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  // Clear existing data — keep this idempotent
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    LearningPath.deleteMany({}),
    Enrollment.deleteMany({}),
    Team.deleteMany({}),
  ]);

  // --- Users ---
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const users = await User.insertMany(
    Array.from({ length: 12 }, (_, i) => ({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: passwordHash,
      role: ROLES[i % ROLES.length],
    }))
  );

  const admin = users.find(u => u.role === 'admin');
  const manager = users.find(u => u.role === 'manager');
  const employees = users.filter(u => u.role === 'employee');

  // --- Team ---
  const team = await Team.create({
    name: faker.commerce.department() + ' Team',
    manager: manager._id,
    members: employees.map(e => e._id),
  });

  // --- Courses ---
  const courses = await Course.insertMany(
  Array.from({ length: 6 }, () => ({
    title: faker.company.catchPhrase(),
    description: faker.lorem.paragraph(),
    hours: faker.number.int({ min: 1, max: 40 }),
    provider: faker.company.name(),
    createdBy: admin._id,
  }))
);
  // --- Learning Paths ---
  const paths = await LearningPath.insertMany(
    Array.from({ length: 2 }, () => ({
      title: faker.commerce.department() + ' Onboarding',
      courses: faker.helpers.arrayElements(courses, { min: 2, max: 4 }).map(c => c._id),
      createdBy: admin._id,
    }))
  );

  // --- Enrollments ---
  const statuses = ['not_started', 'in_progress', 'completed'];
  const enrollments = [];
  for (const employee of employees) {
    const assignedCourses = faker.helpers.arrayElements(courses, { min: 2, max: 4 });
    for (const course of assignedCourses) {
      enrollments.push({
        user: employee._id,
        course: course._id,
        status: faker.helpers.arrayElement(statuses),
        progress: faker.number.int({ min: 0, max: 100 }),
      });
    }
  }
  await Enrollment.insertMany(enrollments);

  console.log(`Seeded: ${users.length} users, ${courses.length} courses, ${paths.length} paths, ${enrollments.length} enrollments`);
  console.log(`Login as any user with password: Password123!`);
  console.log(`Admin: ${admin.email} | Manager: ${manager.email}`);

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});