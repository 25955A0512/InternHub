const notificationModel = require('../models/notificationModel');

const notificationController = {

  // GET MY NOTIFICATIONS
  getMyNotifications: async (req, res) => {
    try {
      const notifications = await notificationModel.getByUser(req.user.id);
      const unreadCount = await notificationModel.getUnreadCount(req.user.id);

      res.status(200).json({
        message: '✅ Notifications fetched',
        unreadCount,
        notifications
      });
    } catch (error) {
      console.error('Get notifications error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // MARK AS READ
  markAsRead: async (req, res) => {
    try {
      await notificationModel.markAsRead(req.params.id, req.user.id);
      res.status(200).json({ message: '✅ Marked as read' });
    } catch (error) {
      console.error('Mark read error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // MARK ALL AS READ
  markAllAsRead: async (req, res) => {
    try {
      await notificationModel.markAllAsRead(req.user.id);
      res.status(200).json({ message: '✅ All marked as read' });
    } catch (error) {
      console.error('Mark all read error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // DELETE NOTIFICATION
  deleteNotification: async (req, res) => {
    try {
      await notificationModel.delete(req.params.id, req.user.id);
      res.status(200).json({ message: '✅ Notification deleted' });
    } catch (error) {
      console.error('Delete notification error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }

};

module.exports = notificationController;