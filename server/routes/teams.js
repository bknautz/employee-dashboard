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
} = require('../controllers/teamController');

const router = express.Router();

router.get('/', requireAuth, getAllTeams);
router.post('/', requireAuth, requireRole('admin'), validate(teamSchema), createTeam);
router.get('/:id', requireAuth, getTeamById);
router.put('/:id', requireAuth, requireRole('admin'), validate(teamSchema.partial()), updateTeam);
router.delete('/:id', requireAuth, requireRole('admin'), deleteTeam);

module.exports = router;
