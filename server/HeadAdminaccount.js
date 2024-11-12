const express = require('express');
const pool = require('../public/scripts/db');// Assuming you have already set up your database connection in the 'db.js' file
const router = express.Router();

// Fetch active accounts (from AdminStaff)
router.get('/admin-staff', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT CONCAT("firstname", ' ', "Lastname") AS fullname, "Role"
            FROM public."AdminStaff";
        `);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching active staff', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Fetch archived accounts (from ArchivedStaff)
router.get('/archived-staff', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT CONCAT("firstname", ' ', "Lastname") AS fullname, "Role", "email"
            FROM public."ArchivedStaff";
        `);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching archived staff', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Archive an account (with email and password)
router.post('/archive-account', async (req, res) => {
    const { fullname } = req.body;

    try {
        // Fetch the account to archive from AdminStaff
        const accountResult = await pool.query(`
            SELECT * FROM public."AdminStaff"
            WHERE CONCAT("firstname", ' ', "Lastname") = $1;
        `, [fullname]);

        if (accountResult.rows.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const account = accountResult.rows[0];

        // Insert the account into ArchivedStaff including email and password
        await pool.query(`
            INSERT INTO public."ArchivedStaff" ("firstname", "Lastname", "Role", "email", "password")
            VALUES ($1, $2, $3, $4, $5);
        `, [account.firstname, account.Lastname, account.Role, account.email, account.password]);

        // Remove the account from AdminStaff
        await pool.query(`
            DELETE FROM public."AdminStaff"
            WHERE CONCAT("firstname", ' ', "Lastname") = $1;
        `, [fullname]);

        res.status(200).json({ message: 'Account archived successfully' });
    } catch (err) {
        console.error('Error archiving account', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Unarchive an account (with email and password)
router.post('/unarchive-account', async (req, res) => {
    const { fullname } = req.body;

    try {
        // Fetch the account to unarchive from ArchivedStaff
        const accountResult = await pool.query(`
            SELECT "firstname", "Lastname", "Role", "email", "password"
            FROM public."ArchivedStaff"
            WHERE CONCAT("firstname", ' ', "Lastname") = $1;
        `, [fullname]);

        if (accountResult.rows.length === 0) {
            return res.status(404).json({ error: 'Account not found in archive' });
        }

        const account = accountResult.rows[0];

        // Insert the account back into AdminStaff, including email and password
        await pool.query(`
            INSERT INTO public."AdminStaff" ("firstname", "Lastname", "Role", "email", "password")
            VALUES ($1, $2, $3, $4, $5);
        `, [account.firstname, account.Lastname, account.Role, account.email, account.password]);

        // Remove the account from ArchivedStaff
        await pool.query(`
            DELETE FROM public."ArchivedStaff"
            WHERE CONCAT("firstname", ' ', "Lastname") = $1;
        `, [fullname]);

        res.status(200).json({ message: 'Account unarchived successfully' });
    } catch (err) {
        console.error('Error unarchiving account', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Fetch inspectors (from Inspectors table)
router.get('/inspectors', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT "name"
            FROM public."inspectors";
        `);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching inspectors', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Archive an inspector account
router.post('/archive-inspector', async (req, res) => {
    const { fullname } = req.body;

    try {
        // Fetch the inspector to archive from Inspectors
        const inspectorResult = await pool.query(`
            SELECT * FROM public."inspectors"
            WHERE "name" = $1;
        `, [fullname]);

        if (inspectorResult.rows.length === 0) {
            return res.status(404).json({ error: 'Inspector not found' });
        }

        const inspector = inspectorResult.rows[0];

        // Insert the inspector into ArchivedInspectors
        await pool.query(`
            INSERT INTO public."ArchivedInspectors" ("inspector_id", "name", "email", "password")
            VALUES ($1, $2, $3, $4);
        `, [inspector.inspector_id, inspector.name, inspector.email, inspector.password]);

        // Remove the inspector from Inspectors
        await pool.query(`
            DELETE FROM public."inspectors"
            WHERE "name" = $1;
        `, [fullname]);

        res.status(200).json({ message: 'Inspector archived successfully' });
    } catch (err) {
        console.error('Error archiving inspector', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Unarchive an inspector account
router.post('/unarchive-inspector', async (req, res) => {
    const { fullname } = req.body;

    try {
        // Fetch the inspector to unarchive from ArchivedInspectors
        const inspectorResult = await pool.query(`
            SELECT "inspector_id", "name", "email", "password"
            FROM public."ArchivedInspectors"
            WHERE "name" = $1;
        `, [fullname]);

        if (inspectorResult.rows.length === 0) {
            return res.status(404).json({ error: 'Inspector not found in archive' });
        }

        const inspector = inspectorResult.rows[0];

        // Insert the inspector back into Inspectors
        await pool.query(`
            INSERT INTO public."inspectors" ("inspector_id", "name", "email", "password")
            VALUES ($1, $2, $3, $4);
        `, [inspector.inspector_id, inspector.name, inspector.email, inspector.password]);

        // Remove the inspector from ArchivedInspectors
        await pool.query(`
            DELETE FROM public."ArchivedInspectors"
            WHERE "name" = $1;
        `, [fullname]);

        res.status(200).json({ message: 'Inspector unarchived successfully' });
    } catch (err) {
        console.error('Error unarchiving inspector', err);
        res.status(500).json({ error: 'Server Error' });
    }
});


// Fetch archived inspectors (from ArchivedInspectors table)
router.get('/archived-inspectors', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT "name"
            FROM public."ArchivedInspectors";
        `);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching archived inspectors', err);
        res.status(500).json({ error: 'Server Error' });
    }
});


module.exports = router;
