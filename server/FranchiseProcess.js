const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('../public/scripts/db'); // Adjust the path to your db.js file if necessary
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(cors());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Endpoint to check renewal eligibility
router.get('/check-renewal', async (req, res) => {
    const { tfid } = req.query;
    const client = await pool.connect();
    try {
        const checkRenewalQuery = `
            SELECT applicationdate 
            FROM tricyclefranchise 
            WHERE tfid = $1 
            ORDER BY applicationdate DESC 
            LIMIT 1
        `;
        const result = await client.query(checkRenewalQuery, [tfid]); // Use tfid here

        if (result.rows.length > 0) {
            const lastRenewalDate = result.rows[0].applicationdate;
            res.json({ exists: true, lastRenewalDate });
        } else {
            res.json({ exists: false });
        }
    } catch (err) {
        console.error('Error checking renewal:', err);
        res.status(500).json({ error: 'Error checking renewal status' });
    } finally {
        client.release();
    }
});

// Endpoint to fetch the most recent record for an applicant
router.get('/fetch-record', async (req, res) => {
    const { tfid } = req.query;
    const client = await pool.connect();
    try {
        const fetchQuery = `
          SELECT * FROM tricyclefranchise
            WHERE tfid = $1
            ORDER BY applicationdate DESC
            LIMIT 1
        `;
        const result = await client.query(fetchQuery, [tfid]);

        if (result.rows.length > 0) {
            const record = result.rows[0];

            // Fetch associated units
            const fetchUnitsQuery = `
                SELECT unit_name, unit_model, motor_no, chassis_no, plate_no
                FROM tricycleunits
                WHERE tfid = $1
            `;
            const unitsResult = await client.query(fetchUnitsQuery, [record.tfid]);

            // Return the record with units included
            res.json({
                success: true,
                record: {
                    ...record,
                    nameApplicant: record.nameapplicant,
                    typeOwnership: record.typeownership, // Map database field to camelCase
                    numUnits: record.numunits,            // Map numunits to numUnits
                    units: unitsResult.rows,             // Include units in the response
                    officialDriver: record.officialdriver, // Ensure proper mapping for official driver
                    licenseNumber: record.licensenumber   // Ensure proper mapping for license number
                }
            });
        } else {
            res.json({ success: false, message: 'No existing record found.' });
        }
    } catch (err) {
        console.error('Error fetching record:', err);
        res.status(500).send('Error fetching record');
    } finally {
        client.release();
    }
});

// Endpoint to submit form data
router.post('/submit', upload.single('signatureApplicant'), async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            applicationType,
            nameApplicant,
            date,
            route,
            barangay,
            municipality,
            province,
            occupation,
            typeOwnership,   
            numUnits,        
            officialDriver,  
            licenseNumber,   
            certificationDate,
            subscribedDay,
            subscribedMonth,
            subscribedYear,
            communityTaxCertNo,
            certificateIssueDate,
            inspectedBy,
            unitName,
            unitModel,
            unitMotorNo,
            unitChassisNo,
            unitPlateNo
        } = req.body;

        let signatureApplicant = req.file ? req.file.buffer : null;

        await client.query('BEGIN');

        if (applicationType === 'renewal') {
            // Fetch the previous signature if not uploaded
            if (!signatureApplicant) {
                const previousSignatureQuery = `
                    SELECT signatureapplicant 
                    FROM tricyclefranchise 
                    WHERE nameapplicant = $1 
                    ORDER BY applicationdate DESC 
                    LIMIT 1
                `;
                const previousSignatureResult = await client.query(previousSignatureQuery, [nameApplicant]);

                // Log the result for debugging
                console.log("Previous Signature Result:", previousSignatureResult.rows);

                if (previousSignatureResult.rows.length > 0) {
                    signatureApplicant = previousSignatureResult.rows[0].signatureapplicant;
                    console.log("Using previous signature:", signatureApplicant);
                } else {
                    console.log("No previous signature found.");
                }
            } else {
                console.log("New signature uploaded:", signatureApplicant);
            }

            const updateQuery = `
                UPDATE tricyclefranchise
                SET 
                    applicationdate = $1,
                    applicationtype = 'renewal',  -- Set application type to "renewal"
                    certificationdate = $2,
                    subscribedday = $3,
                    subscribedmonth = $4,
                    subscribedyear = $5,
                    communitytaxcertno = $6,
                    certificateissuedate = $7,
                    route = $8,
                    barangay = $9,
                    municipality = $10,
                    province = $11,
                    occupation = $12,
                    typeownership = $13,
                    numunits = $14,
                    officialdriver = $15,
                    licensenumber = $16,
                    signatureapplicant = $17
                WHERE nameapplicant = $18
                RETURNING tfid
            `;
            const result = await client.query(updateQuery, [
                date,                   // applicationdate
                certificationDate,      // certificationdate
                subscribedDay,          // subscribedday
                subscribedMonth,        // subscribedmonth
                subscribedYear,         // subscribedyear
                communityTaxCertNo,     // communitytaxcertno
                certificateIssueDate,   // certificateissuedate
                route,                  // route
                barangay,               // barangay
                municipality,           // municipality
                province,               // province
                occupation,             // occupation
                typeOwnership,          // typeownership
                numUnits,               // numunits
                officialDriver,         // officialdriver
                licenseNumber,          // licensenumber
                signatureApplicant,     // signatureapplicant (autofilled if not uploaded)
                nameApplicant           // nameapplicant
            ]);

            console.log("Update Query Result:", result.rows);

            await client.query('COMMIT');
            res.json({ message: 'Form renewed and updated successfully with autofilled signature!', debug: result.rows });
        } else {
            const insertFranchiseQuery = `
                INSERT INTO tricyclefranchise (
                    applicationtype,
                    nameapplicant,
                    applicationdate,
                    route,
                    barangay,
                    municipality,
                    province,
                    occupation,
                    typeownership,   
                    numunits,        
                    officialdriver,  
                    licensenumber,  
                    certificationdate,
                    signatureapplicant,
                    subscribedday,
                    subscribedmonth,
                    subscribedyear,
                    communitytaxcertno,
                    certificateissuedate,
                    inspectedby
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
                RETURNING tfid
            `;
            const result = await client.query(insertFranchiseQuery, [
                applicationType,
                nameApplicant,
                date,
                route,
                barangay,
                municipality,
                province,
                occupation,
                typeOwnership,   // Inserted typeOwnership
                numUnits,        // Inserted numUnits
                officialDriver,  // Inserted officialDriver
                licenseNumber,   // Inserted licenseNumber
                certificationDate || null,
                signatureApplicant,
                subscribedDay,
                subscribedMonth,
                subscribedYear,
                communityTaxCertNo,
                certificateIssueDate,
                inspectedBy,
            ]);

            const tfid = result.rows[0].tfid;

            const insertUnitQuery = `
                INSERT INTO tricycleunits (tfid, unit_name, unit_model, motor_no, chassis_no, plate_no)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;

            for (let i = 0; i < unitName.length; i++) {
                await client.query(insertUnitQuery, [
                    tfid,
                    unitName[i],
                    unitModel[i],
                    unitMotorNo[i],
                    unitChassisNo[i],
                    unitPlateNo[i]
                ]);
            }

            await client.query('COMMIT');
            res.send('Form submitted successfully!');
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error submitting form');
    } finally {
        client.release();
    }
});

module.exports = router;
