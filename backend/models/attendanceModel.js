const pool = require('../config/db');

const attendanceModel = {

  // Check if already checked in today
  getTodayAttendance: async (intern_id) => {
    const result = await pool.query(
      `SELECT * FROM attendance 
       WHERE intern_id = $1 
       AND date = CURRENT_DATE`,
      [intern_id]
    );
    return result.rows[0];
  },

  // Check in
  checkIn: async (intern_id, face_verified) => {
    const result = await pool.query(
      `INSERT INTO attendance 
        (intern_id, date, check_in_time, face_verified, status)
       VALUES ($1, CURRENT_DATE, NOW(), $2, 'present')
       RETURNING *`,
      [intern_id, face_verified]
    );
    return result.rows[0];
  },

  // Check out
  checkOut: async (intern_id) => {
    const result = await pool.query(
      `UPDATE attendance 
       SET check_out_time = NOW()
       WHERE intern_id = $1 
       AND date = CURRENT_DATE
       RETURNING *`,
      [intern_id]
    );
    return result.rows[0];
  },

  // Get attendance by intern
  getByIntern: async (intern_id) => {
    const result = await pool.query(
      `SELECT * FROM attendance
       WHERE intern_id = $1
       ORDER BY date DESC`,
      [intern_id]
    );
    return result.rows;
  },

  // Get all attendance (HR/Admin)
  getAll: async () => {
    const result = await pool.query(
      `SELECT a.*, i.full_name AS intern_name
       FROM attendance a
       JOIN interns i ON a.intern_id = i.id
       ORDER BY a.date DESC, a.check_in_time DESC`
    );
    return result.rows;
  },

  // Get attendance report for intern
  getReport: async (intern_id) => {
    const result = await pool.query(
      `SELECT 
        COUNT(*) AS total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late_days,
        ROUND(
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
        ) AS attendance_percentage
       FROM attendance
       WHERE intern_id = $1`,
      [intern_id]
    );
    return result.rows[0];
  },

  // Update face image URL
  updateFaceImage: async (intern_id, face_image_url) => {
    const result = await pool.query(
      `UPDATE interns SET face_image_url = $1 WHERE id = $2 RETURNING *`,
      [face_image_url, intern_id]
    );
    return result.rows[0];
  }

};

module.exports = attendanceModel;