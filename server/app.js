require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const learningPathRoutes = require('./routes/learningPaths');
const teamRoutes = require('./routes/teams');
const enrollmentRoutes = require('./routes/enrollments');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/enrollments', enrollmentRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'API running' });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
