const express = require('express');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { learningPathSchema } = require('../validators/learningPathValidator');
const {
  getAllLearningPaths,
  createLearningPath,
  getLearningPathById,
  updateLearningPath,
  deleteLearningPath,
} = require('../controllers/learningPathController');

const router = express.Router();

router.get('/', requireAuth, getAllLearningPaths);
router.post('/', requireAuth, requireRole('admin'), validate(learningPathSchema), createLearningPath);
router.get('/:id', requireAuth, getLearningPathById);
router.put('/:id', requireAuth, requireRole('admin'), validate(learningPathSchema.partial()), updateLearningPath);
router.delete('/:id', requireAuth, requireRole('admin'), deleteLearningPath);

module.exports = router;
