const pool = require('../config/db');

const taskModel = {

  // Create task
  createTask: async (data) => {
    const { title, description, assigned_to, assigned_by, deadline, priority } = data;
    const result = await pool.query(
      `INSERT INTO tasks 
        (title, description, assigned_to, assigned_by, deadline, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [title, description, assigned_to, assigned_by, deadline, priority]
    );
    return result.rows[0];
  },

  // Get all tasks (admin/hr)
  getAllTasks: async () => {
    const result = await pool.query(
      `SELECT t.*, 
              i.full_name AS intern_name,
              m.full_name AS mentor_name
       FROM tasks t
       JOIN interns i ON t.assigned_to = i.id
       JOIN mentors m ON t.assigned_by = m.id
       ORDER BY t.created_at DESC`
    );
    return result.rows;
  },

  // Get tasks assigned by mentor
  getTasksByMentor: async (mentor_id) => {
    const result = await pool.query(
      `SELECT t.*, i.full_name AS intern_name
       FROM tasks t
       JOIN interns i ON t.assigned_to = i.id
       WHERE t.assigned_by = $1
       ORDER BY t.created_at DESC`,
      [mentor_id]
    );
    return result.rows;
  },

  // Get tasks assigned to intern
  getTasksByIntern: async (intern_id) => {
    const result = await pool.query(
      `SELECT t.*, m.full_name AS mentor_name
       FROM tasks t
       JOIN mentors m ON t.assigned_by = m.id
       WHERE t.assigned_to = $1
       ORDER BY t.created_at DESC`,
      [intern_id]
    );
    return result.rows;
  },

  // Get single task
  getById: async (id) => {
    const result = await pool.query(
      `SELECT t.*,
              i.full_name AS intern_name,
              m.full_name AS mentor_name
       FROM tasks t
       JOIN interns i ON t.assigned_to = i.id
       JOIN mentors m ON t.assigned_by = m.id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Update task status
  updateStatus: async (id, status) => {
    const result = await pool.query(
      `UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  // Submit task (intern)
  submitTask: async (id) => {
    const result = await pool.query(
      `UPDATE tasks SET status = 'submitted' WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

};

module.exports = taskModel;