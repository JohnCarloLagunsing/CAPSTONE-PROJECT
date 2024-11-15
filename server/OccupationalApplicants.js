// occustatus.js
const express = require("express");
const router = express.Router();
const pool = require('../public/scripts/db');

// Route to get application status
router.post("/getStatus", async (req, res) => {
    const userId = req.session.user_id;
    const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || "http://localhost:8000"; // Default to localhost if not defined

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized. Please log in first.",
            redirectUrl: `${PUBLIC_BASE_URL}/applicantlogin.html`
        });
    }

    try {
        // Check if the user has a submitted application
        const sessionResult = await pool.query(
            "SELECT occuid FROM permit_session WHERE sid = $1 AND has_submitted = TRUE",
            [userId]
        );

        if (sessionResult.rows.length === 0) {
            // No submitted application found
            return res.status(404).json({
                message: "No submitted application found, please submit first.",
                redirect: true,
                redirectUrl: `${PUBLIC_BASE_URL}/applicantdashboard.html`
            });
        }

        const occuid = sessionResult.rows[0].occuid;
        const statusResult = await pool.query(
            "SELECT * FROM Occustatus WHERE occuid = $1",
            [occuid]
        );

        if (statusResult.rows.length > 0) {
            // Status found
            res.status(200).json({ status: statusResult.rows[0] });
        } else {
            // Status not found for the provided occuid
            res.status(404).json({
                message: "Status not found for the provided Occuid.",
                redirect: false
            });
        }
    } catch (error) {
        console.error("Error fetching status:", error);
        res.status(500).json({ message: "An error occurred while fetching the status" });
    }
});

module.exports = router;
