// Import necessary modules
const express = require('express');
const pool = require('../public/scripts/db');// Assuming your database connection
const router = express.Router();

// Create a new session for users who haven't submitted documents
router.post('/createSessionForNewUser', async (req, res) => {
    const userId = req.session.user_id; // Assuming `user_id` is set when the user logs in

    // Ensure the user is authenticated
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
    }

    try {
        // Check if an active session already exists for this user
        const existingSession = await pool.query(
            'SELECT * FROM permit_session WHERE sid = $1 AND expire > CURRENT_TIMESTAMP',
            [userId]
        );

        if (existingSession.rows.length > 0) {
            return res.status(200).json({ message: 'Session already active' });
        }

        // Set expiration time (1 hour from now, adjust if needed)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        // Insert a new session with has_submitted = FALSE for a new user
        await pool.query(
            'INSERT INTO permit_session (sid, sess, expire, has_submitted) VALUES ($1, $2, $3, FALSE)',
            [userId, JSON.stringify({}), expiresAt]
        );

        res.status(201).json({ message: 'Session created for new user (no submission)' });
    } catch (error) {
        console.error('Error creating session for new user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
