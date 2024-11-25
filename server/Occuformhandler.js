// Occuformhandler.js
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const pool = require('../public/scripts/db');

const router = express.Router();
router.use(cors());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/submitForm",
  upload.fields([
    { name: "coe", maxCount: 1 },
    { name: "healthCard", maxCount: 1 },
    { name: "birthCertificate", maxCount: 1 },
    { name: "officialReceipt", maxCount: 1 },
  ]),
  async (req, res) => {
    // Check if user is authenticated
    if (!req.session.user_id) {
      return res.status(400).json({ message: "User not authenticated. Please log in." });
    }

    // Check if occuid is set in the session and if a status check is needed
    if (req.session.occuid) {
      try {
        console.log("Performing status check for occuid:", req.session.occuid);

        // Query to check if there's an existing application with "Approved" or "On Process" status
        const checkQuery = `
          SELECT status 
          FROM public."occustatus" 
          WHERE "occuid" = $1 AND (status = 'Approved' OR status = 'On Process')
        `;
        const checkResult = await pool.query(checkQuery, [req.session.occuid]);

        // Debugging log to see the result of the status check
        console.log("Status check result:", checkResult.rows);

        // If there's a matching result, prevent submission
        if (checkResult.rows.length > 0) {
          const existingStatus = checkResult.rows[0].status;

          if (existingStatus === "Approved") {
            return res.status(400).json({ message: "You already have an approved application and cannot submit another." });
          } else if (existingStatus === "On Process") {
            return res.status(400).json({ message: "Your application is still in process. Please wait for approval." });
          }
        }
      } catch (error) {
        console.error("Error checking for existing application:", error.stack);
        return res.status(500).json({ message: "Error checking application status" });
      }
    }

    // If no restrictions are found, proceed with submission
    console.log("Form data:", req.body);
    console.log("Files:", req.files);

    const {
      lastName,
      firstName,
      middleName,
      suffix,
      homeAddress,
      dob,
      age,
      placeOfBirth,
      cellphoneNumber,
      email,
      gender,
      civilStatus,
      companyName,
      jobPosition,
      combinedId,
      ctcNumber,
      ctcDateIssued,
      ctcPlaceIssued,
    } = req.body;

    const coe = req.files["coe"] ? req.files["coe"][0].buffer : null;
    const healthCard = req.files["healthCard"] ? req.files["healthCard"][0].buffer : null;
    const birthCertificate = req.files["birthCertificate"] ? req.files["birthCertificate"][0].buffer : null;
    const officialReceipt = req.files["officialReceipt"] ? req.files["officialReceipt"][0].buffer : null;

    // Ensure required files are present
    if (!coe || !officialReceipt) {
      return res.status(400).json({ message: "Required files (Certificate of Employment and Official Receipt) are missing." });
    }

    try {
      // Insert form data into OccuPermit
      const query = `
        INSERT INTO public."OccuPermit" (
          "Lastname", "Firstname", "Middlename", "Suffix", "Address", "DateofBirth", "Age", "PlaceofBirth",
          "ContactNo", "Email", "Gender", "CivilStatus", "CompanyName", "JobPosition", "combinedId",
          "COE", "HealthCard", "BirthCertificate", "OfficialReceipt",
          "CTCNumber", "CTCDateIssued", "CTCPlaceIssued"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        ) RETURNING "Occuid"
      `;

      const values = [
        lastName,
        firstName,
        middleName,
        suffix,
        homeAddress,
        dob,
        age,
        placeOfBirth,
        cellphoneNumber,
        email,
        gender,
        civilStatus,
        companyName,
        jobPosition,
        combinedId,
        coe,
        healthCard,
        birthCertificate,
        officialReceipt,
        ctcNumber,
        ctcDateIssued,
        ctcPlaceIssued
      ];

      // Insert the form data and get the generated Occuid
      const result = await pool.query(query, values);
      const occuid = result.rows[0].Occuid.toString(); // Convert occuid to string to match VARCHAR type

      // Update session to set has_submitted to TRUE and store occuid as VARCHAR
      await pool.query(
        'UPDATE session SET sess = jsonb_set(sess, $2, $3::jsonb) WHERE sess ->> \'user_id\' = $1',
        [
          req.session.user_id,
          '{has_submitted}',
          'true'
        ]
      );
      
      await pool.query(
        'UPDATE session SET sess = jsonb_set(sess, $2, $3::jsonb) WHERE sess ->> \'user_id\' = $1',
        [
          req.session.user_id,
          '{occuid}',
          JSON.stringify(occuid)
        ]
      );

      // Set occuid in the session
      req.session.occuid = occuid;

      // Save session and respond
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Error saving session" });
        }
        console.log("Session successfully saved with occuid:", req.session.occuid);
        res.status(200).json({ message: "Form submitted successfully!", occuid });
      });

    } catch (err) {
      console.error("Error inserting data:", err.stack); // More detailed logging
      res.status(500).json({ message: "Error submitting form", error: err.message });
    }
  }
);

module.exports = router;
