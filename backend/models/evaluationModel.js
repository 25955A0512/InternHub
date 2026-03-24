const pool = require('../config/db');

const evaluationModel = {

  // Create evaluation
  createEvaluation: async (data) => {
    const {
      intern_id, mentor_id,
      attendance_score, task_score,
      quality_score, communication_score,
      teamwork_score, remarks
    } = data;

    // Auto calculate total score (average of 5)
    const total_score = Math.round(
      (attendance_score + task_score + quality_score +
       communication_score + teamwork_score) / 5
    );

    const result = await pool.query(
      `INSERT INTO evaluations
        (intern_id, mentor_id, attendance_score, task_score,
         quality_score, communication_score, teamwork_score,
         total_score, remarks)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [intern_id, mentor_id, attendance_score, task_score,
       quality_score, communication_score, teamwork_score,
       total_score, remarks]
    );
    return result.rows[0];
  },

  // Get evaluation by intern
  getByIntern: async (intern_id) => {
    const result = await pool.query(
      `SELECT e.*, 
              i.full_name AS intern_name,
              m.full_name AS mentor_name
       FROM evaluations e
       JOIN interns i ON e.intern_id = i.id
       JOIN mentors m ON e.mentor_id = m.id
       WHERE e.intern_id = $1
       ORDER BY e.evaluated_at DESC`,
      [intern_id]
    );
    return result.rows;
  },

  // Get all evaluations (admin/hr)
  getAll: async () => {
    const result = await pool.query(
      `SELECT e.*,
              i.full_name AS intern_name,
              m.full_name AS mentor_name
       FROM evaluations e
       JOIN interns i ON e.intern_id = i.id
       JOIN mentors m ON e.mentor_id = m.id
       ORDER BY e.evaluated_at DESC`
    );
    return result.rows;
  },

  // Get single evaluation
  getById: async (id) => {
    const result = await pool.query(
      `SELECT e.*,
              i.full_name AS intern_name,
              m.full_name AS mentor_name
       FROM evaluations e
       JOIN interns i ON e.intern_id = i.id
       JOIN mentors m ON e.mentor_id = m.id
       WHERE e.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Add this new method:
getLeaderboard: async () => {
  const result = await pool.query(
    `SELECT 
      i.full_name,
      i.college,
      i.role_applied,
      e.total_score,
      e.attendance_score,
      e.task_score,
      e.quality_score,
      e.communication_score,
      e.teamwork_score,
      e.remarks,
      RANK() OVER (ORDER BY e.total_score DESC) as rank
    FROM evaluations e
    JOIN interns i ON e.intern_id = i.id
    ORDER BY e.total_score DESC`
  );
  return result.rows;
}

};

module.exports = evaluationModel;