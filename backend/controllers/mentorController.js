const mentorModel = require('../models/mentorModel');

const mentorController = {

  createProfile: async (req, res) => {
    try {
      const { full_name, department, phone } = req.body;

      if (!full_name || !department || !phone) {
        return res.status(400).json({
          message: 'full_name, department and phone are required'
        });
      }

      const existing = await mentorModel.getByUserId(req.user.id);
      if (existing) {
        return res.status(400).json({
          message: 'Profile already exists'
        });
      }

      const mentor = await mentorModel.createProfile({
        user_id: req.user.id,
        full_name,
        department,
        phone
      });

      res.status(201).json({
        message: '✅ Mentor profile created successfully',
        mentor
      });

    } catch (error) {
      console.error('Create mentor error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getAllMentors: async (req, res) => {
    try {
      const mentors = await mentorModel.getAll();
      res.status(200).json({
        message: '✅ Mentors fetched successfully',
        count: mentors.length,
        mentors
      });
    } catch (error) {
      console.error('Get mentors error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getMyProfile: async (req, res) => {
    try {
      const mentor = await mentorModel.getByUserId(req.user.id);
      if (!mentor) {
        return res.status(404).json({
          message: 'Profile not found. Please create your profile.'
        });
      }
      res.status(200).json({ mentor });
    } catch (error) {
      console.error('Get mentor profile error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }

};

module.exports = mentorController;