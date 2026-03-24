const taskModel = require('../models/taskModel');
const mentorModel = require('../models/mentorModel');
const internModel = require('../models/internModel');
const notify = require('../utils/notificationHelper');
const { sendEmail, emailTemplates } = require('../utils/emailHelper');
const pool = require('../config/db');

const taskController = {

  createTask: async (req, res) => {
    try {
      const { title, description, assigned_to, deadline, priority } = req.body;

      if (!title || !assigned_to || !deadline) {
        return res.status(400).json({
          message: 'title, assigned_to and deadline are required'
        });
      }

      const mentor = await mentorModel.getByUserId(req.user.id);
      if (!mentor) {
        return res.status(404).json({
          message: 'Mentor profile not found'
        });
      }

      const task = await taskModel.createTask({
        title,
        description,
        assigned_to,
        assigned_by: mentor.id,
        deadline,
        priority: priority || 'medium'
      });

      // ✅ Get intern's user_id and email
      const internData = await pool.query(
        `SELECT i.user_id, i.full_name, u.email 
         FROM interns i 
         JOIN users u ON i.user_id = u.id 
         WHERE i.id = $1`,
        [assigned_to]
      );

      if (internData.rows[0]) {
        const { user_id, full_name, email } = internData.rows[0];

        // ✅ In-app notification
        await notify(
          user_id,
          '📋 New Task Assigned!',
          `You have been assigned a new task: "${title}". Deadline: ${new Date(deadline).toLocaleDateString()}`,
          'info'
        );

        // ✅ Email notification
        const emailContent = emailTemplates.taskAssigned(full_name, title, deadline);
        await sendEmail(email, emailContent.subject, emailContent.html);
      }

      res.status(201).json({
        message: '✅ Task created successfully',
        task
      });

    } catch (error) {
      console.error('Create task error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getAllTasks: async (req, res) => {
    try {
      const tasks = await taskModel.getAllTasks();
      res.status(200).json({
        message: '✅ Tasks fetched successfully',
        count: tasks.length,
        tasks
      });
    } catch (error) {
      console.error('Get all tasks error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getMyTasksAsMentor: async (req, res) => {
    try {
      const mentor = await mentorModel.getByUserId(req.user.id);
      if (!mentor) {
        return res.status(404).json({ message: 'Mentor profile not found' });
      }

      const tasks = await taskModel.getTasksByMentor(mentor.id);
      res.status(200).json({
        message: '✅ Tasks fetched successfully',
        count: tasks.length,
        tasks
      });
    } catch (error) {
      console.error('Get mentor tasks error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getMyTasksAsIntern: async (req, res) => {
    try {
      const intern = await internModel.getByUserId(req.user.id);
      if (!intern) {
        return res.status(404).json({ message: 'Intern profile not found' });
      }

      const tasks = await taskModel.getTasksByIntern(intern.id);
      res.status(200).json({
        message: '✅ Tasks fetched successfully',
        count: tasks.length,
        tasks
      });
    } catch (error) {
      console.error('Get intern tasks error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateTaskStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ['pending', 'in_progress', 'submitted', 'approved', 'overdue'];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: 'Invalid status value'
        });
      }

      const task = await taskModel.updateStatus(req.params.id, status);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // ✅ Notify intern when task is approved or rejected
      const internData = await pool.query(
        `SELECT i.user_id, i.full_name 
         FROM interns i 
         WHERE i.id = $1`,
        [task.assigned_to]
      );

      if (internData.rows[0]) {
        const { user_id, full_name } = internData.rows[0];

        if (status === 'approved') {
          await notify(
            user_id,
            '✅ Task Approved!',
            `Your task "${task.title}" has been approved by your mentor. Great work!`,
            'success'
          );
        } else if (status === 'overdue') {
          await notify(
            user_id,
            '⚠️ Task Overdue!',
            `Your task "${task.title}" is now marked as overdue. Please submit it as soon as possible.`,
            'warning'
          );
        }
      }

      res.status(200).json({
        message: `✅ Task status updated to ${status}`,
        task
      });

    } catch (error) {
      console.error('Update task status error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  submitTask: async (req, res) => {
    try {
      const task = await taskModel.submitTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // ✅ Notify mentor when intern submits task
      const mentorData = await pool.query(
        `SELECT m.user_id, i.full_name AS intern_name
         FROM mentors m
         JOIN interns i ON i.mentor_id = m.id
         WHERE m.id = $1`,
        [task.assigned_by]
      );

      if (mentorData.rows[0]) {
        const { user_id, intern_name } = mentorData.rows[0];
        await notify(
          user_id,
          '📬 Task Submitted!',
          `${intern_name} has submitted the task "${task.title}". Please review and approve it.`,
          'info'
        );
      }

      res.status(200).json({
        message: '✅ Task submitted successfully',
        task
      });

    } catch (error) {
      console.error('Submit task error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }

};

module.exports = taskController;