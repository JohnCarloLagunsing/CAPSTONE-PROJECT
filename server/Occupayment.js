const express = require('express');
const bodyParser = require('body-parser');
const pool = require('../public/scripts/db');
const router = express.Router();

// Middleware
router.use(bodyParser.json());

// Search Functionality
router.post('/search', async (req, res) => {
    const { searchValue } = req.body;
    if (!searchValue) {
        return res.status(400).json({ success: false, message: 'Search value is required' });
    }

    try {
        const result = await pool.query(
            `SELECT "Occuid", CONCAT("Firstname", ' ', LEFT("Middlename", 1), '. ', "Lastname") AS name, "Address", "CTCDateIssued" AS date_issued
             FROM "OccuPermit"
             WHERE "Occuid" = $1 OR "Firstname" ILIKE $2 OR "Lastname" ILIKE $2`,
            [searchValue, `%${searchValue}%`]
        );
        

        if (result.rows.length > 0) {
            res.status(200).json({ success: true, data: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'No record found' });
        }
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});


// Save Payment
router.post('/save-payment', async (req, res) => {
    const {
        occuid,
        name,
        dateIssued,
        policeMedicalClearance,
        callingFee,
        idCardFee,
        occupationalFee,
        total,
        amountPaid,
        orNumber, // Add OR number to the request body
    } = req.body;

    if (!occuid || !name || !dateIssued || !total || !amountPaid || !orNumber) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const change = parseFloat((amountPaid - total).toFixed(2));
    const status = amountPaid >= total ? 'paid' : 'pending';

    const receipt = {
        name,
        occuid,
        dateIssued,
        orNumber,
        policeFee: parseFloat(policeMedicalClearance).toFixed(2),
        callingFee: parseFloat(callingFee).toFixed(2),
        idCardFee: parseFloat(idCardFee).toFixed(2),
        occupationalFee: parseFloat(occupationalFee).toFixed(2),
        total: parseFloat(total).toFixed(2),
        amountPaid: parseFloat(amountPaid).toFixed(2),
        change
    };
    

    try {
        const checkResult = await pool.query(`SELECT * FROM "occupationalpayments" WHERE occuid = $1`, [occuid]);

        if (checkResult.rows.length > 0) {
            const existingRecord = checkResult.rows[0];
            if (existingRecord.status === 'paid') {
                return res.status(400).json({ success: false, message: 'The applicant has already paid.' });

            }

            await pool.query(
                `UPDATE "occupationalpayments" 
                 SET name = $2, date_issued = $3, police_medical_clearance = $4, calling_fee = $5, id_card_fee = $6, 
                     occupational_fee = $7, total = $8, amount_paid = $9, change = $10, status = $11, or_number = $12
                 WHERE occuid = $1`,
                [
                    occuid,
                    name,
                    dateIssued,
                    policeMedicalClearance,
                    callingFee,
                    idCardFee,
                    occupationalFee,
                    total,
                    amountPaid,
                    change,
                    status,
                    orNumber, // Include OR number
                ]
            );

            res.status(200).json({ success: true, message: 'Payment updated successfully', receipt });
        } else {
            await pool.query(
                `INSERT INTO "occupationalpayments" 
                 (occuid, name, date_issued, police_medical_clearance, calling_fee, id_card_fee, occupational_fee, 
                  total, amount_paid, change, status, receipt, or_number)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [
                    occuid,
                    name,
                    dateIssued,
                    policeMedicalClearance,
                    callingFee,
                    idCardFee,
                    occupationalFee,
                    total,
                    amountPaid,
                    change,
                    status,
                    receipt,
                    orNumber, // Include OR number
                ]
            );

            res.status(200).json({ success: true, message: 'Payment saved successfully', receipt });
        }
    } catch (err) {
        console.error('Payment error:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});




// View Receipt
router.get('/view-receipt/:paymentId', async (req, res) => {
    const { paymentId } = req.params;
    try {
        const result = await pool.query(`SELECT receipt FROM "OccupationalPayments" WHERE payment_id = $1`, [paymentId]);

        if (result.rows.length > 0) {
            res.status(200).json({ success: true, receipt: result.rows[0].receipt });
        } else {
            res.status(404).json({ success: false, message: 'Receipt not found' });
        }
    } catch (err) {
        console.error('View receipt error:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});


//view reciept
router.get('/get-paid-receipts', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM "occupationalpayments" 
             WHERE status = $1 
             ORDER BY date_issued DESC 
             LIMIT 5`, 
             ['paid']
        );

        if (result.rows.length > 0) {
            res.json({
                success: true,
                data: result.rows
            });
        } else {
            res.json({
                success: false,
                message: 'No paid receipts found.'
            });
        }
    } catch (error) {
        console.error('Error fetching paid receipts:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching paid receipts.' });
    }
});

module.exports = router;
