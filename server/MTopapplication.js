const express = require("express");
const router = express.Router();
const pool = require('../public/scripts/db');

router.get('/mtopdata', async (req, res) => {
  try {
    const query = `
  SELECT 
    mas.name, 
    mas.status, 
    ma.application_type, 
    ma.id
  FROM 
    mtopapplicationstatus mas
  JOIN 
    mtopapplication ma 
  ON 
    mas.mtopapplication_id = ma.id;
`;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching MTOP data:', error);
    res.status(500).send('Server error');
  }
});


router.get('/mtopapplication/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).send('Invalid ID');
      }
      
  
      const query = `
        SELECT 
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
        FROM 
          mtopapplication 
        WHERE 
          id = $1;
      `;
      const result = await pool.query(query, [id]);
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).send('Record not found');
      }
    } catch (error) {
      console.error('Error fetching record:', error);
      res.status(500).send('Server error');
    }
  });
  
module.exports=router;