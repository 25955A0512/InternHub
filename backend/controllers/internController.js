const internModel = require('../models/internModel');
const notify = require('../utils/notificationHelper');
const { sendEmail, emailTemplates } = require('../utils/emailHelper');
const pool = require('../config/db');

const internController = {

  createProfile: async (req, res) => {
    try {
      const { full_name, phone, college, skills, role_applied, program_id } = req.body;

      if (!full_name || !phone || !college || !role_applied) {
        return res.status(400).json({
          message: 'full_name, phone, college and role_applied are required'
        });
      }

      const existing = await internModel.getByUserId(req.user.id);
      if (existing) {
        return res.status(400).json({
          message: 'Profile already exists for this user'
        });
      }

      const intern = await internModel.createProfile({
        user_id: req.user.id,
        full_name,
        phone,
        college,
        skills,
        role_applied,
        program_id
      });

      res.status(201).json({
        message: '✅ Intern profile created successfully',
        intern
      });

    } catch (error) {
      console.error('Create profile error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  uploadResume: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const intern = await internModel.getByUserId(req.user.id);
      if (!intern) {
        return res.status(404).json({
          message: 'Please create your profile first'
        });
      }

      const resume_url = `uploads/${req.file.filename}`;
      const updated = await internModel.updateResume(intern.id, resume_url);

      res.status(200).json({
        message: '✅ Resume uploaded successfully',
        resume_url: updated.resume_url
      });

    } catch (error) {
      console.error('Upload resume error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getAllInterns: async (req, res) => {
    try {
      const interns = await internModel.getAllInterns();
      res.status(200).json({
        message: '✅ Interns fetched successfully',
        count: interns.length,
        interns
      });
    } catch (error) {
      console.error('Get all interns error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getInternById: async (req, res) => {
    try {
      const intern = await internModel.getById(req.params.id);
      if (!intern) {
        return res.status(404).json({ message: 'Intern not found' });
      }
      res.status(200).json({ intern });
    } catch (error) {
      console.error('Get intern error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getMyProfile: async (req, res) => {
    try {
      const intern = await internModel.getByUserId(req.user.id);
      if (!intern) {
        return res.status(404).json({
          message: 'Profile not found. Please create your profile.'
        });
      }
      res.status(200).json({ intern });
    } catch (error) {
      console.error('Get my profile error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // ✅ THIS IS WHERE EMAIL IS ADDED — updateStatus function
  updateStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ['active', 'rejected', 'pending', 'completed'];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: 'Status must be active, rejected, pending or completed'
        });
      }

      const intern = await internModel.updateStatus(req.params.id, status);
      if (!intern) {
        return res.status(404).json({ message: 'Intern not found' });
      }

      // ✅ Get intern's user email from DB
      const userResult = await pool.query(
        'SELECT u.email FROM users u WHERE u.id = $1',
        [intern.user_id]
      );
      const userEmail = userResult.rows[0]?.email;

      // ✅ Send notification + email based on status
      if (status === 'active') {
        // In-app notification
        await notify(
          intern.user_id,
          '✅ Application Approved!',
          'Congratulations! Your internship application has been approved by HR. You are now an active intern.',
          'success'
        );

        // Email notification
        if (userEmail) {
          const emailContent = emailTemplates.approved(intern.full_name);
          await sendEmail(userEmail, emailContent.subject, emailContent.html);
        }

      } else if (status === 'rejected') {
        // In-app notification
        await notify(
          intern.user_id,
          '❌ Application Update',
          'Your internship application status has been updated. Please contact HR for more information.',
          'warning'
        );

      } else if (status === 'completed') {
        // In-app notification
        await notify(
          intern.user_id,
          '🎓 Internship Completed!',
          'Congratulations on completing your internship! Your certificate will be generated soon.',
          'success'
        );
      }

      res.status(200).json({
        message: `✅ Intern status updated to ${status}`,
        intern
      });

    } catch (error) {
      console.error('Update status error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  assignMentor: async (req, res) => {
    try {
      const { mentor_id } = req.body;

      if (!mentor_id) {
        return res.status(400).json({ message: 'mentor_id is required' });
      }

      const intern = await internModel.assignMentor(req.params.id, mentor_id);
      if (!intern) {
        return res.status(404).json({ message: 'Intern not found' });
      }

      // ✅ Notify intern about mentor assignment
      await notify(
        intern.user_id,
        '👨‍💼 Mentor Assigned!',
        'A mentor has been assigned to guide you through your internship. Check your profile for details.',
        'info'
      );

      res.status(200).json({
        message: '✅ Mentor assigned successfully',
        intern
      });

    } catch (error) {
      console.error('Assign mentor error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }

};

module.exports = internController;
