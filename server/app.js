require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const learningPathRoutes = require('./routes/learningPaths');
const teamRoutes = require('./routes/teams');
const enrollmentRoutes = require('./routes/enrollments');
const userRoutes = require('./routes/users');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'API running' });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
