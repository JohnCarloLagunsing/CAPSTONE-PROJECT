const express = require('express');
const sharp = require('sharp'); // For image resizing and compression
const pool = require('../public/scripts/db'); // Adjust the path if needed
const router = express.Router();

// Fetch MTOP data along with scanned images (with pagination and image compression)
router.get('/fetchMTOPDetails', async (req, res) => {
    console.log('Request received at /fetchMTOPDetails');
    const { page = 1, limit = 10 } = req.query; // Default to page 1, 10 records per page
    const offset = (page - 1) * limit;

    try {
        // Query to fetch raw image data
        const query = `
            SELECT 
                mtop_id,
                barangay_clearance, police_clearance, sss_certificate,
                philhealth_certificate, applicant_fee, certificate_of_registration, drivers_license
            FROM scandocu
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, [limit, offset]);

        // Count total records for pagination metadata
        const countQuery = `SELECT COUNT(*) AS total FROM scandocu`;
        const countResult = await pool.query(countQuery);
        const totalRecords = parseInt(countResult.rows[0].total, 10);

        // Helper function to compress images
        const compressImage = async (image) => {
            if (!image) return null;
            return await sharp(image)
                .resize(300, 450) // Resize image to 300x450 pixels
                .toBuffer()
                .then((buffer) => buffer.toString('base64')); // Convert to base64
        };

        // Process all rows and compress images
        const data = await Promise.all(result.rows.map(async (row) => {
            return {
                mtop_id: row.mtop_id,
                documents: {
                    barangay_clearance: await compressImage(row.barangay_clearance),
                    police_clearance: await compressImage(row.police_clearance),
                    sss_certificate: await compressImage(row.sss_certificate),
                    philhealth_certificate: await compressImage(row.philhealth_certificate),
                    applicant_fee: await compressImage(row.applicant_fee),
                    certificate_of_registration: await compressImage(row.certificate_of_registration),
                    drivers_license: await compressImage(row.drivers_license),
                },
            };
        }));

        // Return the paginated response
        res.json({
            status: 'success',
            data,
            pagination: {
                currentPage: parseInt(page, 10),
                totalPages: Math.ceil(totalRecords / limit),
                totalRecords,
            },
        });
    } catch (error) {
        console.error('Error fetching MTOP details:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
});

module.exports = router;
