const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public route — no token needed for verification
router.get('/verify/:qr_code', certificateController.verifyCertificate);

router.use(verifyToken);

router.post('/generate', authorizeRoles('hr', 'admin'), certificateController.generateCertificate);
router.get('/my', authorizeRoles('intern'), certificateController.getMyCertificate);

module.exports = router;