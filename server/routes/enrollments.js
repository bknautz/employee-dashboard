const express = require('express');
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { enrollSchema, progressSchema } = require('../validators/enrollmentValidator');
const {
  enroll,
  getMyEnrollments,
  updateProgress,
  markComplete,
} = require('../controllers/enrollmentController');

const router = express.Router();

router.post('/', requireAuth, validate(enrollSchema), enroll);
router.get('/me', requireAuth, getMyEnrollments);
router.patch('/:id/progress', requireAuth, validate(progressSchema), updateProgress);
router.post('/:id/complete', requireAuth, markComplete);

module.exports = router;
