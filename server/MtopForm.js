const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('../public/scripts/db'); // Adjust the path as needed
const router = express.Router();

router.use(cors());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Endpoint to submit MTOP form data
router.post('/submitMtopForm', async (req, res) => {
    console.log('Request Body:', req.body); // Log request body for debugging
    const client = await pool.connect();
    try {
        const {
            applicationType,    // New or Renewal
            applicantNo,
            operatorName,
            operatorAddress,
            vehicleNameMake,
            engineNumber,
            chassisNo,
            plateStickerNo,
            driverName,
            driverAddress,
            licenseNo,
            applicationDate,
        } = req.body;

        await client.query('BEGIN');

        if (applicationType === 'Renewal') {
            // Update existing record for renewal
            const updateQuery = `
                UPDATE MtopApplication
                SET 
                    application_date = $1,
                    operator_name = $2,
                    operator_address = $3,
                    vehicle_name_make = $4,
                    engine_number = $5,
                    chassis_no = $6,
                    plate_sticker_no = $7,
                    driver_name = $8,
                    driver_address = $9,
                    license_no = $10
                WHERE applicant_no = $11
                RETURNING id
            `;
            const result = await client.query(updateQuery, [
                applicationDate,
                operatorName,
                operatorAddress,
                vehicleNameMake,
                engineNumber,
                chassisNo,
                plateStickerNo,
                driverName,
                driverAddress,
                licenseNo,
                applicantNo,
            ]);

            await client.query('COMMIT');
            res.json({ message: 'MTOP renewed successfully!', id: result.rows[0].id });
        } else {
            // Insert new record for new application
            const insertMtopQuery = `
                INSERT INTO MtopApplication (
                    application_type,
                    applicant_no,
                    operator_name,
                    operator_address,
                    vehicle_name_make,
                    engine_number,
                    chassis_no,
                    plate_sticker_no,
                    driver_name,
                    driver_address,
                    license_no,
                    application_date
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING id
            `;
            const result = await client.query(insertMtopQuery, [
                applicationType,
                applicantNo,
                operatorName,
                operatorAddress,
                vehicleNameMake,
                engineNumber,
                chassisNo,
                plateStickerNo,
                driverName,
                driverAddress,
                licenseNo,
                applicationDate,
            ]);

            await client.query('COMMIT');
            res.json({ message: 'MTOP application submitted successfully!', id: result.rows[0].id });
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error submitting MTOP form:', err);
        res.status(500).send('Error submitting form');
    } finally {
        client.release();
    }
});

module.exports = router;
