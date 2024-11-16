const express = require('express');
const router = express.Router();
const pool = require('../db'); // Adjust to your database configuration

// Submit payment details
router.post('/submitPayment', async (req, res) => {
    const {
        applicant_no,
        operator_name,
        operator_address,
        category,
        units,
        total,
        fees,
        amount_paid,
        change_due,
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO ApplicantPayments (
                applicant_no, operator_name, operator_address, category, units, total, 
                filling_fee, business_permit_fee, mtop_fee, pol_med_mayor_fee, plate_number_fee, 
                inspection_fee, id_card_fee, sec_fee, dst_fee, supervision_fee, penalty_fee, 
                amount_paid, change_due
            ) VALUES (
                $1, $2, $3, $4, $5, $6, 
                $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
            ) RETURNING *`,
            [
                applicant_no,
                operator_name,
                operator_address,
                category,
                units,
                total,
                fees.filling_fee,
                fees.business_permit_fee,
                fees.mtop_fee,
                fees.pol_med_mayor_fee,
                fees.plate_number_fee,
                fees.inspection_fee,
                fees.id_card_fee,
                fees.sec_fee,
                fees.dst_fee,
                fees.supervision_fee,
                fees.penalty_fee,
                amount_paid,
                change_due,
            ]
        );

        res.status(200).json({ message: 'Payment submitted successfully!', data: result.rows[0] });
    } catch (err) {
        console.error('Error inserting payment details:', err);
        res.status(500).json({ message: 'Server error while submitting payment details.' });
    }
});

module.exports = router;
