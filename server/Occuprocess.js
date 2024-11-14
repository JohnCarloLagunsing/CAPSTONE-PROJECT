const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors package
const pool = require('../public/scripts/db');
const router = express.Router();
const port = 8000;

// Use cors middleware
router.use(cors());

// Use memoryStorage for multer to keep files in memory as buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Endpoint to handle form submission with binary file storage
router.post('/submitForm', upload.fields([
    { name: 'coe', maxCount: 1 },
    { name: 'healthCard', maxCount: 1 },
    { name: 'birthCertificate', maxCount: 1 },
    { name: 'officialReceipt', maxCount: 1 }
]), async (req, res) => {
    const {
        lastName, firstName, middleName, suffix, homeAddress, dob, age, placeOfBirth,
        cellphoneNumber, email, gender, civilStatus, companyName, jobPosition, combinedId,
        ctcNumber, ctcDateIssued, ctcPlaceIssued
    } = req.body;

    // Get binary data (buffers) from multer for each file
    const coe = req.files['coe'] ? req.files['coe'][0].buffer : null;
    const healthCard = req.files['healthCard'] ? req.files['healthCard'][0].buffer : null;
    const birthCertificate = req.files['birthCertificate'] ? req.files['birthCertificate'][0].buffer : null;
    const officialReceipt = req.files['officialReceipt'] ? req.files['officialReceipt'][0].buffer : null;

    try {
        const query = `
            INSERT INTO public."OccuPermit" (
                "Lastname", "Firstname", "Middlename", "Suffix", "Address", "DateofBirth", "Age", "PlaceofBirth",
                "ContactNo", "Email", "Gender", "CivilStatus", "CompanyName", "JobPosition", "combinedId",
                "COE", "HealthCard", "BirthCertificate", "OfficialReceipt",
                 "CTCNumber", "CTCDateIssued", "CTCPlaceIssued"
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
                $13, $14, $15, $16, $17, $18, $19, $20, $21, $22 
            )
        `;
        
        // Format the CTC date for insertion
        const formattedCtcDateIssued = new Date(ctcDateIssued).toISOString().split('T')[0];

        const values = [
            lastName, firstName, middleName, suffix, homeAddress, dob, age, placeOfBirth,
            cellphoneNumber, email, gender, civilStatus, companyName, jobPosition, combinedId,
            coe, healthCard, birthCertificate, officialReceipt,
            ctcNumber, formattedCtcDateIssued, ctcPlaceIssued
        ];

        // Insert the form data along with the binary files into the database
        await pool.query(query, values);
        res.send('Form submitted successfully!');
    } catch (err) {
        console.error('Error inserting data', err);
        res.status(500).send('Error submitting form');
    }
});

// Serve static files from 'uploads' directory (though we're not using this with memoryStorage)
router.use('/uploads', express.static('uploads'));

// Start the server
module.exports = router;
