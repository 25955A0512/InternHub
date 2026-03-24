const notificationModel = require('../models/notificationModel');

// Helper to send notifications easily from anywhere
const notify = async (user_id, title, message, type = 'info') => {
  try {
    await notificationModel.create(user_id, title, message, type);
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

module.exports = notify;