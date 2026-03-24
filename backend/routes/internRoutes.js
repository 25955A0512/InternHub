const express = require('express');
const router = express.Router();
const internController = require('../controllers/internController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// All routes below require login
router.use(verifyToken);

// Intern routes (intern only)
router.post('/profile', authorizeRoles('intern'), internController.createProfile);
router.post('/resume', authorizeRoles('intern'), upload.single('resume'), internController.uploadResume);
router.get('/me', authorizeRoles('intern'), internController.getMyProfile);

// HR/Admin routes
router.get('/', authorizeRoles('hr', 'admin', 'mentor'), internController.getAllInterns);
router.get('/:id', authorizeRoles('hr', 'admin', 'mentor'), internController.getInternById);
router.put('/:id/status', authorizeRoles('hr', 'admin'), internController.updateStatus);
router.put('/:id/mentor', authorizeRoles('hr', 'admin'), internController.assignMentor);

module.exports = router;
