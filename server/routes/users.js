const express = require('express');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { updateUserSchema } = require('../validators/userValidator');
const { getAllUsers, updateUser } = require('../controllers/userController');

const router = express.Router();

router.get('/', requireAuth, requireRole('admin'), getAllUsers);
router.patch('/:id', requireAuth, requireRole('admin'), validate(updateUserSchema), updateUser);

module.exports = router;
