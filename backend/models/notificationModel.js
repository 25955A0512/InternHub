const pool = require('../config/db');

const notificationModel = {

  // Create notification
  create: async (user_id, title, message, type = 'info') => {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, title, message, type]
    );
    return result.rows[0];
  },

  // Get all notifications for a user
  getByUser: async (user_id) => {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [user_id]
    );
    return result.rows;
  },

  // Get unread count
  getUnreadCount: async (user_id) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM notifications
       WHERE user_id = $1 AND is_read = false`,
      [user_id]
    );
    return parseInt(result.rows[0].count);
  },

  // Mark single notification as read
  markAsRead: async (id, user_id) => {
    const result = await pool.query(
      `UPDATE notifications SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, user_id]
    );
    return result.rows[0];
  },

  // Mark all as read
  markAllAsRead: async (user_id) => {
    await pool.query(
      `UPDATE notifications SET is_read = true
       WHERE user_id = $1`,
      [user_id]
    );
  },

  // Delete notification
  delete: async (id, user_id) => {
    await pool.query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );
  }

};

module.exports = notificationModel;