const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const pool = require('../public/scripts/db');

router.post('/changePassword', async (req, res) => {
    const { email, password, confirmPassword } = req.body;
  
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }
  
    try {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Update the password in the Inspectors table
      const result = await pool.query(
        'UPDATE Inspectors SET password = $1 WHERE email = $2',
        [hashedPassword, email]
      );
  
      if (result.rowCount > 0) {
        res.status(200).json({ message: 'Password changed successfully.' });
      } else {
        res.status(404).json({ message: 'Email not found.' });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  module.exports = router;
  