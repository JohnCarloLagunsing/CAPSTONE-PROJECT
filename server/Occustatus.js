const express = require("express");
const router = express.Router();
const pool = require('../public/scripts/db');

router.post("/getStatus", async (req, res) => {
    const userId = req.session?.user_id;

    if (!userId) {
        console.error("Unauthorized access: No session user ID found.");
        return res.status(401).json({ 
            message: "Unauthorized. Please log in first.", 
            redirect: true 
        });
    }

    try {
        console.log("Session User ID:", userId);

        // Query the permit_session table
        const sessionResult = await pool.query(
            "SELECT occuid FROM permit_session WHERE sid = $1 AND has_submitted = TRUE",
            [userId]
        );

        console.log("Permit Session Query Result:", sessionResult.rows);

        // If no entry is found in permit_session
        if (sessionResult.rows.length === 0) {
            console.warn(`No submitted application found for user ID ${userId}.`);
            return res.status(404).json({ 
                message: "No submitted application found. Please submit first.", 
                redirect: true 
            });
        }

        const occuid = sessionResult.rows[0].occuid;

        // Check if occuid is valid
        if (!occuid) {
            console.error(`Occuid is missing for user ID ${userId} in permit_session.`);
            return res.status(404).json({ 
                message: "Occuid is missing. Please contact support.", 
                redirect: true 
            });
        }

        console.log("Occuid from permit_session:", occuid);

        // Query the Occustatus table
        const statusResult = await pool.query(
            "SELECT * FROM Occustatus WHERE occuid = $1",
            [occuid]
        );

        console.log("Occustatus Query Result:", statusResult.rows);

        // If no entry is found in Occustatus
        if (statusResult.rows.length === 0) {
            console.warn(`No status found for occuid ${occuid}.`);
            return res.status(404).json({ 
                message: "Status not found for your application.", 
                redirect: false 
            });
        }

        // Send the status result
        res.status(200).json(statusResult.rows[0]);
    } catch (error) {
        console.error("Error fetching status:", error);
        res.status(500).json({ 
            message: "An error occurred while fetching the status. Please try again later.", 
            redirect: false 
        });
    }
});

module.exports = router;
