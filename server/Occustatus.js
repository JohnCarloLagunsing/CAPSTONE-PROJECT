// status.js
const express = require("express");
const router = express.Router();
const pool = require('../public/scripts/db');

// Occustatus.js
// Occustatus.js
router.post("/getStatus", async (req, res) => {
    const userId = req.session.user_id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }

    try {
        const sessionResult = await pool.query(
            "SELECT occuid FROM permit_session WHERE sid = $1 AND has_submitted = TRUE",
            [userId]
        );

        if (sessionResult.rows.length === 0) {
            // Return a specific response to indicate no application found
            return res.status(404).json({ 
                message: "No submitted application found, please submit first.",
                redirect: true // Add this flag for frontend to check
            });
        }

        const occuid = sessionResult.rows[0].occuid;
        const statusResult = await pool.query(
            "SELECT * FROM Occustatus WHERE occuid = $1",
            [occuid]
        );

        if (statusResult.rows.length > 0) {
            res.json(statusResult.rows[0]);
        } else {
            res.status(404).json({ message: "Status not found" });
        }
    } catch (error) {
        console.error("Error fetching status:", error);
        res.status(500).json({ message: "An error occurred while fetching the status" });
    }
});


module.exports = router;
