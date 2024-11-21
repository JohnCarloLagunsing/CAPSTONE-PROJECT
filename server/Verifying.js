const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session'); // Add session middleware
const pool = require('../public/scripts/db');
const router = express.Router();
const pgSession = require('connect-pg-simple')(session);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
const path = require('path');
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session' // Customize session table name
    }),
    secret: process.env.SESSION_SECRET || 'aV3ryC0mpl3xP@ssphr@se1234!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: false // Set to true in production
    }
}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  // This will allow access to /uploads/<file_name>

// Route to get tricycle franchise records
router.get('/getRecords', (req, res) => {
    const sqlQuery = `
        SELECT 
            tf.tfid, 
            tf.applicationtype, 
            tf.nameapplicant, 
            tf.applicationdate, 
            tf.route, 
            tf.barangay, 
            tf.municipality, 
            tf.province, 
            tf.occupation, 
            tf.typeownership,
            tf.numunits, 
            tf.officialdriver, 
            tf.licensenumber, 
            tf.certificationdate, 
            encode(tf.signatureapplicant, 'base64') as signatureapplicant,
            tf.subscribedday, 
            tf.subscribedmonth, 
            tf.subscribedyear, 
            tf.communitytaxcertno, 
            tf.inspectedby, 
            STRING_AGG(tu.unit_name, ', ') AS unit_names,
            STRING_AGG(tu.unit_model, ', ') AS unit_models,
            STRING_AGG(tu.motor_no, ', ') AS motor_numbers,
            STRING_AGG(tu.chassis_no, ', ') AS chassis_numbers,
            STRING_AGG(tu.plate_no, ', ') AS plate_numbers,
            s.status  
        FROM 
            tricyclefranchise tf
        LEFT JOIN 
            tricycleunits tu ON tf.tfid = tu.tfid
        LEFT JOIN
            status s ON tf.tfid = s.tfid  
        GROUP BY 
            tf.tfid, 
            tf.applicationtype, 
            tf.nameapplicant, 
            tf.applicationdate, 
            tf.route, 
            tf.barangay, 
            tf.municipality, 
            tf.province, 
            tf.occupation, 
            tf.typeownership,
            tf.numunits, 
            tf.officialdriver, 
            tf.licensenumber, 
            tf.certificationdate, 
            tf.subscribedday, 
            tf.subscribedmonth, 
            tf.subscribedyear, 
            tf.communitytaxcertno, 
            tf.inspectedby,
            s.status  
        ORDER BY 
            tf.tfid;
    `;

    pool.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.message);
            return res.status(500).send('Error fetching data');
        }
        if (results.rows.length === 0) {
            return res.status(404).send('No records found');
        }
        res.json(results.rows);
    });
});

// Route to get occupational applicants
router.get('/getOccupationalApplicants', (req, res) => {
    const sqlQuery = `
        SELECT 
            occuid, 
            fullname, 
            status, 
            process_by 
        FROM 
            occustatus
        ORDER BY 
            occuid;
    `;

    pool.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.message);
            return res.status(500).send('Error fetching occupational applicants');
        }
        if (results.rows.length === 0) {
            return res.status(404).send('No occupational applicants found');
        }
        res.json(results.rows);
    });
});

router.post('/updateStatus', (req, res) => {
    console.log("Session data in Verifying.js:", req.session);

    const { tfid, occuid, status, firstname, lastname } = req.body;
    const processedBy = [
        firstname?.trim() || req.session.first_name || req.session.firstname || '',
        lastname?.trim() || req.session.last_name || req.session.lastname || ''
    ].filter(Boolean).join(' ');

    console.log("Processed By:", processedBy); // Check what is being passed

    if (!occuid && !tfid) {
        return res.status(400).send('Missing required parameters: tfid or occuid');
    }

    if (occuid) {
        const sqlUpdateOccustatus = `
            UPDATE occustatus
            SET status = $1, process_by = $2
            WHERE occuid = $3;
        `;
        pool.query(sqlUpdateOccustatus, [status, processedBy, occuid], (err, result) => {
            if (err) {
                console.error('Error executing occustatus update query:', err.message);
                return res.status(500).send('Error updating status in occustatus table');
            }
            res.json({ message: 'Occustatus updated successfully' });
        });
    } else if (tfid) {
        const sqlUpdateStatus = `
            UPDATE status
            SET status = $1, processed_by = $2
            WHERE tfid = $3;
        `;
        pool.query(sqlUpdateStatus, [status, processedBy, tfid], (err, result) => {
            if (err) {
                console.error('Error executing status update query:', err.message);
                return res.status(500).send('Error updating status in status table');
            }
            res.json({ message: 'Status updated successfully' });
        });
    }
});

// Route to get specific OccuPermit by occuid
router.get('/getOccuPermitDocuments/:occuid', (req, res) => {
    const occuid = req.params.occuid;

    const sqlQuery = `
        SELECT "Occuid","Lastname", "Firstname", "Middlename", "Suffix", "Address", "DateofBirth", "Age", "PlaceofBirth",
         "ContactNo", "Email", "Gender", "CivilStatus", "CompanyName", "JobPosition", "combinedId", 
          "CTCNumber", "CTCDateIssued", "CTCPlaceIssued", encode("COE", 'base64') as "COE", encode("HealthCard", 'base64') as "HealthCard",
          encode("BirthCertificate", 'base64') as "BirthCertificate",encode("OfficialReceipt", 'base64') as "OfficialReceipt"
        FROM "OccuPermit"
        WHERE "Occuid" = $1;
    `;

    pool.query(sqlQuery, [occuid], (err, results) => {
        if (err) {
            console.error('Error fetching documents:', err.message);
            return res.status(500).send('Error fetching OccuPermit documents');
        }
        if (results.rows.length === 0) {
            console.log(`No record found for Occuid: ${occuid}`);
            return res.status(404).send('No record found');
        }
        res.json(results.rows);
    });
});



module.exports = router;

