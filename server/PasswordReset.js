const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const pool = require('../public/scripts/db');


// Password reset route
router.post('/api/reset-password', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
  
    try {
      // Encrypt the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update the password in the database
      const query = 'UPDATE "AdminStaff" SET password = $1 WHERE email = $2';
      await pool.query(query, [hashedPassword, email]);
  
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });
  

module.exports = router;
