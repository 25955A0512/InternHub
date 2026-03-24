const pool = require('../config/db');

const userModel = {

  // Find user by email (used during login)
  findByEmail: async (email) => {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  // Create new user (used during registration)
  createUser: async (email, hashedPassword, role) => {
    const result = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, role]
    );
    return result.rows[0];
  },

  // Find user by ID (used to get logged in user details)
  findById: async (id) => {
    const result = await pool.query(
      'SELECT id, email, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

};

module.exports = userModel;