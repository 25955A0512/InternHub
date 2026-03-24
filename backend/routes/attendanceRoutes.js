const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Intern routes
router.post('/checkin', authorizeRoles('intern'), attendanceController.checkIn);
router.post('/checkout', authorizeRoles('intern'), attendanceController.checkOut);
router.get('/my', authorizeRoles('intern'), attendanceController.getMyAttendance);
router.get('/my/report', authorizeRoles('intern'), attendanceController.getMyReport);

// HR/Admin/Mentor routes
router.get('/', authorizeRoles('hr', 'admin'), attendanceController.getAllAttendance);
router.get('/:id', authorizeRoles('hr', 'admin', 'mentor'), attendanceController.getAttendanceByInternId);

module.exports = router;