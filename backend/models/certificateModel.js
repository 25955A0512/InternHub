const pool = require('../config/db');

const certificateModel = {

  // Create certificate record
  create: async (intern_id, certificate_url, qr_code) => {
    const result = await pool.query(
      `INSERT INTO certificates (intern_id, certificate_url, qr_code)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [intern_id, certificate_url, qr_code]
    );
    return result.rows[0];
  },

  // Get certificate by intern
  getByIntern: async (intern_id) => {
    const result = await pool.query(
      `SELECT c.*, i.full_name AS intern_name
       FROM certificates c
       JOIN interns i ON c.intern_id = i.id
       WHERE c.intern_id = $1`,
      [intern_id]
    );
    return result.rows[0];
  },

  // Verify certificate by QR code
  verifyByQR: async (qr_code) => {
    const result = await pool.query(
      `SELECT c.*, i.full_name AS intern_name,
              i.college, i.role_applied
       FROM certificates c
       JOIN interns i ON c.intern_id = i.id
       WHERE c.qr_code = $1`,
      [qr_code]
    );
    return result.rows[0];
  }

};

module.exports = certificateModel;