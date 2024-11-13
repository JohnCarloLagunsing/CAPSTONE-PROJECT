const express = require('express');//exp
const router = express.Router();
const pool = require('../public/scripts/db');

router.get('/comparison', async (req, res) => {
    try {
        const inspectionsResult = await pool.query('SELECT COUNT(*) FROM "inspections"');
        const occuPermitResult = await pool.query('SELECT COUNT(*) FROM  "OccuPermit"');

        const inspectionsCount = parseInt(inspectionsResult.rows[0].count, 10);
        const occuPermitCount = parseInt(occuPermitResult.rows[0].count, 10);

        res.json({ inspectionsCount, occuPermitCount });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});

router.get('/inspection-status', async (req, res) => {
    try {
        // Count of inspections marked as "Not Approved"
        const notApprovedCountResult = await pool.query(`
            SELECT COUNT(*) AS not_approved_count 
            FROM inspections 
            WHERE NOT (signal_lights AND taillights AND motor_number AND garbage_can AND chassis_number 
            AND vehicle_registration AND not_open_pipe AND light_in_sidecar AND side_mirror);
        `);

        // Count reasons for "Not Approved" status
        const reasonsResult = await pool.query(`
            SELECT
                SUM(CASE WHEN signal_lights = false THEN 1 ELSE 0 END) AS signal_lights_not_approved,
                SUM(CASE WHEN taillights = false THEN 1 ELSE 0 END) AS taillights_not_approved,
                SUM(CASE WHEN motor_number = false THEN 1 ELSE 0 END) AS motor_number_not_approved,
                SUM(CASE WHEN garbage_can = false THEN 1 ELSE 0 END) AS garbage_can_not_approved,
                SUM(CASE WHEN chassis_number = false THEN 1 ELSE 0 END) AS chassis_number_not_approved,
                SUM(CASE WHEN vehicle_registration = false THEN 1 ELSE 0 END) AS vehicle_registration_not_approved,
                SUM(CASE WHEN not_open_pipe = false THEN 1 ELSE 0 END) AS not_open_pipe_not_approved,
                SUM(CASE WHEN light_in_sidecar = false THEN 1 ELSE 0 END) AS light_in_sidecar_not_approved,
                SUM(CASE WHEN side_mirror = false THEN 1 ELSE 0 END) AS side_mirror_not_approved
            FROM inspections;
        `);

        const notApprovedCount = parseInt(notApprovedCountResult.rows[0].not_approved_count, 10);
        const reasons = reasonsResult.rows[0];

        res.json({ notApprovedCount, reasons });
    } catch (error) {
        console.error('Error fetching inspection data:', error);
        res.status(500).json({ error: 'Error fetching inspection data' });
    }
});


// In your server.js or API router file
router.get('/forecast-data', async (req, res) => {
    try {
        // Fetch monthly counts for OccuPermit and Inspections for the last year
        const occuPermitMonthlyData = await pool.query(`
            SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS count
            FROM "OccuPermit"
            WHERE created_at >= NOW() - INTERVAL '1 year'
            GROUP BY month
            ORDER BY month;
        `);

        const inspectionsMonthlyData = await pool.query(`
            SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS count
            FROM "inspections"
            WHERE created_at >= NOW() - INTERVAL '1 year'
            GROUP BY month
            ORDER BY month;
        `);

        res.json({
            occuPermitData: occuPermitMonthlyData.rows,
            inspectionsData: inspectionsMonthlyData.rows
        });
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        res.status(500).json({ error: 'Error fetching forecast data' });
    }
});

//for data name showing
router.get('/occupermit-applicants', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                "Occuid",  -- Column name should be exactly as shown in your table
                CONCAT("Firstname", ' ', LEFT("Middlename", 1), '. ', "Lastname") AS applicant_name
            FROM "OccuPermit"
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching OccuPermit applicants:', error);
        res.status(500).json({ error: 'Error fetching OccuPermit applicants' });
    }
});


// Fetch mtop_id and applicant_name from inspections
router.get('/inspections-applicants', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                mtop_id, 
                applicant_name 
            FROM "inspections"
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching inspections applicants:', error);
        res.status(500).json({ error: 'Error fetching inspections applicants' });
    }
});

// Add this route to Analysis.js
router.get('/vehicle-types', async (req, res) => {
    try {
        const vehicleTypeResult = await pool.query(`
            SELECT vehicle_type, COUNT(*) AS count
            FROM inspections
            GROUP BY vehicle_type;
        `);
        
        const vehicleTypes = vehicleTypeResult.rows.map(row => ({
            type: row.vehicle_type,
            count: parseInt(row.count, 10)
        }));

        res.json(vehicleTypes);
    } catch (error) {
        console.error('Error fetching vehicle types:', error);
        res.status(500).json({ error: 'Error fetching vehicle types' });
    }
});


router.get('/inspections-by-town', async (req, res) => {
    try {
        // Query to get the count of inspections for 'San Luis' and 'Other Towns'
        const sanLuisQuery = `
            SELECT COUNT(*) AS count 
            FROM inspections 
            WHERE town = 'San Luis'
        `;

        const otherTownsQuery = `
            SELECT COUNT(*) AS count 
            FROM inspections 
            WHERE town != 'San Luis'
        `;

        // Execute both queries
        const [sanLuisResult, otherTownsResult] = await Promise.all([
            pool.query(sanLuisQuery),
            pool.query(otherTownsQuery)
        ]);

        const sanLuisCount = parseInt(sanLuisResult.rows[0].count, 10);
        const otherTownsCount = parseInt(otherTownsResult.rows[0].count, 10);

        // Send the data as JSON
        res.json({
            sanLuis: sanLuisCount,
            otherTowns: otherTownsCount
        });
    } catch (error) {
        console.error('Error fetching inspection data:', error);
        res.status(500).json({ error: 'Error fetching inspection data' });
    }
});


module.exports = router;
