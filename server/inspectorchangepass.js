const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const pool = require('../public/scripts/db');

// Password reset route
router.post('/checkEmail', async (req, res) => {
    const { email } = req.body;
  
    try {
      const result = await pool.query('SELECT * FROM Inspectors WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        res.redirect('/inspectorchangepass2');
      } else {
        res.status(404).json({ message: 'Email not found Please try again.' });
      }
    } catch (error) {
      console.error('Error checking email:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  

module.exports = router;
