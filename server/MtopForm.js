const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('../public/scripts/db'); // Adjust the path as needed
const router = express.Router();

router.use(cors());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Function to show response messages in modern style
const sendModernResponse = (res, statusCode, message, data = null) => {
    res.status(statusCode).json({ message, data });
};

// Endpoint to submit MTOP form data
router.post('/submitMtopForm', async (req, res) => {
    console.log('Request Body:', req.body); // Log request body for debugging
    const client = await pool.connect();
    try {
        const {
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
        } = req.body;

        await client.query('BEGIN');

        const currentYear = new Date().getFullYear();
        const checkQuery = 'SELECT id, application_date FROM MtopApplication WHERE applicant_no = $1';
        const checkResult = await client.query(checkQuery, [applicantNo]);

        if (checkResult.rows.length > 0) {
            const existingApplicationDate = new Date(checkResult.rows[0].application_date);
            if (existingApplicationDate.getFullYear() === currentYear) {
                await client.query('ROLLBACK');
                return sendModernResponse(
                    res,
                    400,
                    'Applicant No. already exists for the current year. Submission not allowed.'
                );
            }
        }

        if (applicationType === 'Renewal') {
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
            return sendModernResponse(res, 200, 'Renewal application successfully updated.', result.rows[0]);
        } else {
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
            return sendModernResponse(res, 200, 'New application successfully submitted.', result.rows[0]);
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error submitting MTOP form:', err);
        return sendModernResponse(res, 500, 'An error occurred while submitting the form.');
    } finally {
        client.release();
    }
});

// Endpoint to search for an applicant by applicantNo with renewal year check
router.get('/searchApplicant/:applicantNo', async (req, res) => {
    const { applicantNo } = req.params;
    try {
        const result = await pool.query('SELECT * FROM MtopApplication WHERE applicant_no = $1', [applicantNo]);

        if (result.rows.length > 0) {
            const applicantData = result.rows[0];
            const applicationDate = new Date(applicantData.application_date);
            const currentYear = new Date().getFullYear();

            if (applicationDate.getFullYear() !== currentYear) {
                return sendModernResponse(res, 200, 'Applicant data retrieved successfully.', applicantData);
            } else {
                return sendModernResponse(res, 400, 'Renewal not allowed as the application is already within the current year.');
            }
        } else {
            return sendModernResponse(res, 404, 'Applicant not found.');
        }
    } catch (err) {
        console.error('Error searching for applicant:', err);
        return sendModernResponse(res, 500, 'An error occurred while searching for the applicant.');
    }
});

module.exports = router;
