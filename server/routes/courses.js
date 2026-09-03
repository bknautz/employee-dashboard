const express = require('express');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const {
  getAllCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

const router = express.Router();

router.get('/', requireAuth, getAllCourses);
router.post('/', requireAuth, requireRole('admin'), createCourse);
router.get('/:id', requireAuth, getCourseById);
router.put('/:id', requireAuth, requireRole('admin'), updateCourse);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCourse);

module.exports = router;
