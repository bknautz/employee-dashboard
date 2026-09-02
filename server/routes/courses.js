const express = require('express');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { getAllCourses, createCourse } = require('../controllers/courseController');

const router = express.Router();

router.get('/', requireAuth, getAllCourses);
router.post('/', requireAuth, requireRole('admin'), createCourse);

module.exports = router;
