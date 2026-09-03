const express = require('express');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { courseSchema } = require('../validators/courseValidator');
const {
  getAllCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

const router = express.Router();

router.post('/', requireAuth, requireRole('admin'), validate(courseSchema), createCourse);
router.put('/:id', requireAuth, requireRole('admin'), validate(courseSchema.partial()), updateCourse);

router.get('/', requireAuth, getAllCourses);
router.get('/:id', requireAuth, getCourseById);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCourse);

module.exports = router;
