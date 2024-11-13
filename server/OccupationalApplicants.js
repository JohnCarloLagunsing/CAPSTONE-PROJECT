// auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require('../public/scripts/db'); // Assuming db.js exports a properly configured pool

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const userResult = await pool.query("SELECT * FROM Users WHERE email = $1", [email]);
    const user = userResult.rows[0];
    
    if (!user) {
      return res.status(400).json({ message: "Invalid email and password. Please try again." });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password. Please try again." });
    }

    // Success: User authenticated
    req.session.user_id = user.id;

    // Check if a session already exists in permit_session for this user
    const sessionResult = await pool.query("SELECT * FROM permit_session WHERE sid = $1", [user.id]);
    
    if (sessionResult.rows.length === 0) {
      // No session exists, create a new one with has_submitted set to FALSE
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Session expires in 1 hour

      await pool.query(
        "INSERT INTO permit_session (sid, sess, expire, has_submitted) VALUES ($1, $2, $3, FALSE)",
        [user.id, JSON.stringify({}), expiresAt]
      );
    }

    res.status(200).json({ message: "Login successful", redirectUrl: "/applicantdashboard.html" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "An error occurred during login" });
  }
});

module.exports = router;
