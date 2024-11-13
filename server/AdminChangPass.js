
const express = require('express');
const router = express.Router();
const pool = require('../public/scripts/db');
// Set up your PostgreSQL connection


// Endpoint to check if email exists
router.post('/api/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    const query = 'SELECT * FROM "AdminStaff" WHERE email = $1';
    const { rows } = await pool.query(query, [email]);

    if (rows.length > 0) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
