const express = require('express');
const router = express.Router();
const pool = require('../public/scripts/db'); // Adjust the path if needed

// Route to handle search by Applicant No.
router.get('/getApplicantByNo/:applicantNo', async (req, res) => {
    const { applicantNo } = req.params;

    try {
        const result = await pool.query(
            `SELECT applicant_no, operator_name, operator_address 
             FROM MtopApplication 
             WHERE applicant_no = $1`, 
            [applicantNo]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'No applicant found with the provided Applicant No.' });
        }
    } catch (err) {
        console.error('Error querying the database:', err);
        res.status(500).json({ message: 'Server error while retrieving applicant details.' });
    }
});

module.exports = router;
