const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../public/scripts/db');

const router = express.Router();

// Handle POST request for login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM "AdminStaff" WHERE email = $1';
        const values = [email];
        const result = await pool.query(query, values);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('User object retrieved from DB:', user); // Log the user object

            // Check if password and other fields are present before trimming
            const storedPassword = user.password ? user.password.trim() : '';
            const match = await bcrypt.compare(password, storedPassword);

            if (!match) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Store user info in session after successful login
            req.session.firstname = user.firstname ? user.firstname.trim() : ''; // Ensure 'firstname' matches your DB field
            req.session.lastname = user.Lastname ? user.Lastname.trim() : '';    // Use capital "L" for Lastname as in your DB

            // Store additional session details like user ID
            req.session.userId = user.id;  // Assuming 'id' is the primary key in the AdminStaff table
            req.session.is_logged_in = true; // Save login status

            console.log('User data saved in session:', {
                userId: req.session.userId,
                firstname: req.session.firstname,
                lastname: req.session.lastname,
                is_logged_in: req.session.is_logged_in
            });

            // Update the `is_logged_in` field in the database to mark user as logged in
            const loginUpdateQuery = 'UPDATE "AdminStaff" SET is_logged_in = true WHERE id = $1';
            await pool.query(loginUpdateQuery, [user.id]);

            // Save session explicitly
            req.session.save(err => {
                if (err) {
                    console.error('Error saving session:', err);
                    return res.status(500).json({ error: 'Session save error' });
                }

                // Log the session data after saving to verify
                console.log('Session saved after login:', req.session);
                res.json({ success: true, message: 'Login successful' });
            });

        } else {
            // If no user found with the provided email
            return res.status(401).json({ error: 'Invalid email or password' });
        }

    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
