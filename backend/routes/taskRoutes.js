const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Mentor routes
router.post('/', authorizeRoles('mentor'), taskController.createTask);
router.get('/my-tasks', authorizeRoles('mentor'), taskController.getMyTasksAsMentor);
router.put('/:id/status', authorizeRoles('mentor'), taskController.updateTaskStatus);

// Intern routes
router.get('/intern-tasks', authorizeRoles('intern'), taskController.getMyTasksAsIntern);
router.put('/:id/submit', authorizeRoles('intern'), taskController.submitTask);

// Admin/HR routes
router.get('/', authorizeRoles('admin', 'hr'), taskController.getAllTasks);

module.exports = router;
