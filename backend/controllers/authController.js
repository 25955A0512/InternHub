const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const notify = require('../utils/notificationHelper');
const { sendEmail, emailTemplates } = require('../utils/emailHelper');


const authController = {

  register: async (req, res) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({
          message: 'Email, password and role are required'
        });
      }

      const validRoles = ['admin', 'hr', 'mentor', 'intern'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          message: 'Invalid role'
        });
      }

      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          message: 'User with this email already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userModel.createUser(email, hashedPassword, role);

      // ✅ Send welcome notification
      await notify(
        newUser.id,
        '🎉 Welcome to InternHub!',
        'Your account has been created. Complete your profile to get started.',
        'success'
      );

      // ✅ Send welcome email
      const emailContent = emailTemplates.welcome(email);
      await sendEmail(email, emailContent.subject, emailContent.html);

      res.status(201).json({
        message: '✅ User registered successfully',
        user: newUser
      });

    } catch (error) {
      console.error('Register error:', error.message);
      res.status(500).json({ message: 'Server error during registration' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: 'Email and password are required'
        });
      }

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }

      if (!user.is_active) {
        return res.status(401).json({
          message: 'Account is deactivated. Contact admin.'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: '✅ Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).json({ message: 'Server error during login' });
    }
  },

  getMe: async (req, res) => {
    try {
      const user = await userModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ user });
    } catch (error) {
      console.error('GetMe error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }

};

module.exports = authController;