const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../public/scripts/db'); // Your PostgreSQL pool setup
const path = require('path');

const router = express.Router();

// Serve static files from the project's root directory
router.use(express.static(path.join(__dirname, '../'))); // Adjust as necessary
router.use(express.json()); // Middleware for JSON body parsing

// GET request handler for the head admin login page
router.get('/headadmin', (req, res) => {
    res.sendFile(path.join(__dirname, '../HeadAdmin.html')); // Replace with actual HTML render or file path
});

// POST request handler for login
router.post('/headadmin', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').not().isEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const trimmedPassword = password.trim(); // Trim whitespace

    try {
        // Query to find admin by email
        const query = 'SELECT * FROM headadmin WHERE email = $1';
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Admin not found' });
        }

        const admin = result.rows[0];
        console.log('Admin fetched from DB:', admin); // Debugging line

        // Direct comparison of passwords (temporarily without encryption)
        if (trimmedPassword !== admin.password) {
            console.log('Password mismatch:', {
                input: trimmedPassword,
                stored: admin.password
            });
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Successful login, redirect to HeadDashboard.html
        return res.status(200).json({ redirect: '/HeadDashboard.html' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Start the server
module.exports = router;
