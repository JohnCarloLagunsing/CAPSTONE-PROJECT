const express = require("express");
const router = express.Router();
const pool = require('../public/scripts/db');

// Fetch records for table
router.get('/getOccupationalRecords', async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT 
                "OccuPermit"."Occuid" AS id, 
                CONCAT("OccuPermit"."Firstname", ' ', LEFT("OccuPermit"."Middlename", 1), '.', ' ', "OccuPermit"."Lastname") AS fullname,
                occustatus.status
            FROM "OccuPermit"
            LEFT JOIN occustatus ON "OccuPermit"."Occuid" = occustatus.occuid
            ORDER BY "OccuPermit"."Occuid" ASC
            `
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching records');
    }
});


// Fetch details for modal
router.get('/getOccupationalDetails/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await pool.query(
            `
            SELECT 
                "OccuPermit"."Occuid" AS id,
                CONCAT("OccuPermit"."Firstname", ' ', LEFT("OccuPermit"."Middlename", 1), '.', ' ', "OccuPermit"."Lastname") AS fullname,
                "OccuPermit"."Address" AS address,
                "OccuPermit"."Age" AS age,
                "OccuPermit"."ContactNo" AS contactno,
                "OccuPermit"."Email" AS email,
                "OccuPermit"."Gender" AS gender,
                "OccuPermit"."CivilStatus" AS civilstatus,
                "OccuPermit"."PlaceofBirth" AS placeofbirth, -- Fixed case for column
                "OccuPermit"."DateofBirth" AS dateofbirth, -- Fixed case for column
                "OccuPermit"."JobPosition" AS jobposition,
                "OccuPermit"."CompanyName" AS companyname,
                "OccuPermit"."CTCNumber" AS ctcnumber
            FROM "OccuPermit"
            WHERE "OccuPermit"."Occuid" = $1
            `,
            [id]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Record not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});




// Update status and approvedBy
router.post('/updateStatus', async (req, res) => {
    try {
        const { occuid, status, approvedBy } = req.body;

        // Validate required parameters
        if (!occuid || !status || !approvedBy) {
            return res.status(400).json({ error: 'Missing required parameters: occuid, status, or approvedBy' });
        }

        // Update the database
        const query = `
            UPDATE occustatus
            SET status = $1, process_by = $2
            WHERE occuid = $3
        `;
        const values = [status, approvedBy, occuid];
        await pool.query(query, values);

        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});




module.exports=router;