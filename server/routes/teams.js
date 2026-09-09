const express = require('express');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { teamSchema } = require('../validators/teamValidator');
const {
  getAllTeams,
  createTeam,
  getTeamById,
  updateTeam,
  deleteTeam,
  getTeamProgress,
  getMyTeamProgress,
} = require('../controllers/teamController');

const router = express.Router();

router.get('/', requireAuth, getAllTeams);
router.post('/', requireAuth, requireRole('admin'), validate(teamSchema), createTeam);
router.get('/mine/progress', requireAuth, requireRole('manager'), getMyTeamProgress);
router.get('/:id', requireAuth, getTeamById);
router.get('/:id/progress', requireAuth, requireRole('admin', 'manager'), getTeamProgress);
router.put('/:id', requireAuth, requireRole('admin'), validate(teamSchema.partial()), updateTeam);
router.delete('/:id', requireAuth, requireRole('admin'), deleteTeam);

module.exports = router;
