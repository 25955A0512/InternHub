const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', authorizeRoles('mentor'), evaluationController.createEvaluation);
router.get('/my', authorizeRoles('intern'), evaluationController.getMyEvaluations);
router.get('/', authorizeRoles('hr', 'admin'), evaluationController.getAllEvaluations);

router.get('/leaderboard', authorizeRoles('admin', 'hr', 'mentor'), evaluationController.getLeaderboard);

module.exports = router;