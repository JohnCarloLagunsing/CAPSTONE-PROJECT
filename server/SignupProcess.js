const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const pool = require('../public/scripts/db');// Assuming you have a db connection in db.js
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const router = express.Router();

// Enable CORS and body parsing middleware
router.use(cors());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Signup route
router.post('/signup_process', async (req, res) => {
  const { Firstname, Lastname, Role, email, password } = req.body;
  const UserID = uuidv4();
  const saltRounds = 10;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
  INSERT INTO public."AdminStaff" (firstname, "Lastname", email, password, "Role") 
  VALUES ($1, $2, $3, $4, $5) RETURNING *`;
  const values = [Firstname, Lastname, email, hashedPassword, Role];


    const result = await pool.query(query, values);
    console.log('User added:', result.rows[0]);
    res.status(200).json({ message: 'Signup successful' });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

module.exports = router;
