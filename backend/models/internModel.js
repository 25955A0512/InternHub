const pool = require('../config/db');

const internModel = {

  // Create intern profile
  createProfile: async (data) => {
    const {
      user_id, full_name, phone, college,
      skills, role_applied, program_id
    } = data;

    const result = await pool.query(
      `INSERT INTO interns 
        (user_id, full_name, phone, college, skills, role_applied, program_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [user_id, full_name, phone, college, skills, role_applied, program_id]
    );
    return result.rows[0];
  },

  // Update resume URL after file upload
  updateResume: async (intern_id, resume_url) => {
    const result = await pool.query(
      `UPDATE interns SET resume_url = $1 WHERE id = $2 RETURNING *`,
      [resume_url, intern_id]
    );
    return result.rows[0];
  },

  // Get all interns (for HR/Admin)
  getAllInterns: async () => {
    const result = await pool.query(
      `SELECT i.*, u.email, 
              m.full_name AS mentor_name,
              p.title AS program_title
       FROM interns i
       JOIN users u ON i.user_id = u.id
       LEFT JOIN mentors m ON i.mentor_id = m.id
       LEFT JOIN internship_programs p ON i.program_id = p.id
       ORDER BY i.created_at DESC`
    );
    return result.rows;
  },

  // Get single intern by ID
  getById: async (id) => {
    const result = await pool.query(
      `SELECT i.*, u.email,
              m.full_name AS mentor_name,
              p.title AS program_title
       FROM interns i
       JOIN users u ON i.user_id = u.id
       LEFT JOIN mentors m ON i.mentor_id = m.id
       LEFT JOIN internship_programs p ON i.program_id = p.id
       WHERE i.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Get intern by user_id (for intern's own profile)
  getByUserId: async (user_id) => {
    const result = await pool.query(
      `SELECT i.*, u.email,
              m.full_name AS mentor_name,
              p.title AS program_title
       FROM interns i
       JOIN users u ON i.user_id = u.id
       LEFT JOIN mentors m ON i.mentor_id = m.id
       LEFT JOIN internship_programs p ON i.program_id = p.id
       WHERE i.user_id = $1`,
      [user_id]
    );
    return result.rows[0];
  },

  // Approve or reject intern (HR)
  updateStatus: async (id, status) => {
    const result = await pool.query(
      `UPDATE interns SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  // Assign mentor to intern (HR)
  assignMentor: async (intern_id, mentor_id) => {
    const result = await pool.query(
      `UPDATE interns SET mentor_id = $1 WHERE id = $2 RETURNING *`,
      [mentor_id, intern_id]
    );
    return result.rows[0];
  }

};

module.exports = internModel;