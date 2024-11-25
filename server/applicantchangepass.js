const express = require('express');
const pool = require('../public/scripts/db');// Assuming you have already set up your database connection in the 'db.js' file
const router = express.Router();
const bcrypt = require('bcryptjs');


// Route to check if the email exists
router.post('/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      // Email exists in the database
      res.json({ exists: true });
    } else {
      // Email does not exist
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/update-password', async (req, res) => {
    const { email, newPassword } = req.body;
  
    try {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password in the database
      const result = await pool.query(
        'UPDATE users SET password = $1 WHERE email = $2',
        [hashedPassword, email]
      );
  
      if (result.rowCount > 0) {
        // Password updated successfully
        res.json({ success: true });
      } else {
        // Failed to update password (email might not exist)
        res.json({ success: false });
      }
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;
