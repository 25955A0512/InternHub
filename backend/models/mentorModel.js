const pool = require('../config/db');

const mentorModel = {

  createProfile: async (data) => {
    const { user_id, full_name, department, phone } = data;
    const result = await pool.query(
      `INSERT INTO mentors (user_id, full_name, department, phone)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, full_name, department, phone]
    );
    return result.rows[0];
  },

  getAll: async () => {
    const result = await pool.query(
      `SELECT m.*, u.email 
       FROM mentors m
       JOIN users u ON m.user_id = u.id
       ORDER BY m.created_at DESC`
    );
    return result.rows;
  },

  getByUserId: async (user_id) => {
    const result = await pool.query(
      `SELECT * FROM mentors WHERE user_id = $1`,
      [user_id]
    );
    return result.rows[0];
  },

  getById: async (id) => {
    const result = await pool.query(
      `SELECT m.*, u.email 
       FROM mentors m
       JOIN users u ON m.user_id = u.id
       WHERE m.id = $1`,
      [id]
    );
    return result.rows[0];
  }

};

module.exports = mentorModel;