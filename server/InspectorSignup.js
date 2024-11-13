const express = require('express');
const pool = require('../public/scripts/db');// Assuming you have already set up your database connection in 'db.js'
const bcrypt = require('bcryptjs');
const router = express.Router();
const path = require('path');

// Serve static files (for CSS and JS files)
router.use(express.static(path.join(__dirname, 'public')));

// Route for the signup form
router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'Signupforinspector.html'));
});

// Route for handling form submission
router.post('/signupInspector', async (req, res) => {
  const { inspector_id, name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO Inspectors (inspector_id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING *`,
      [inspector_id, name, email, hashedPassword]
    );

    res.json({ success: true, message: 'Inspector account created successfully!' });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation in PostgreSQL
      const field = error.detail.includes('inspector_id') ? 'Inspector ID' : 'Email';
      res.status(400).json({ success: false, message: `${field} already exists.` });
    } else {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error creating Inspector account.' });
    }
  }
});


module.exports = router;
