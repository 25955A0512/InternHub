const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/profile', authorizeRoles('mentor'), mentorController.createProfile);
router.get('/me', authorizeRoles('mentor'), mentorController.getMyProfile);
router.get('/', authorizeRoles('hr', 'admin', 'intern'), mentorController.getAllMentors);

module.exports = router;