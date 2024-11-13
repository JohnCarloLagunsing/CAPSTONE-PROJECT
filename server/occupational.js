const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require('../public/scripts/db');// Assuming db.js exports a properly configured pool

// Handle sign-up route
router.post("/", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  console.log("Received data:", { firstName, lastName, email, password });

  // Ensure all required fields are present
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if email already exists
    const checkUser = await pool.query("SELECT * FROM Users WHERE email = $1", [email]);
    if (checkUser.rows.length > 0) {
      console.log("Email already exists:", email);
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user data into the database
    const result = await pool.query(
      "INSERT INTO Users (firstName, lastName, email, password) VALUES ($1, $2, $3, $4) RETURNING id",
      [firstName, lastName, email, hashedPassword]
    );

    // Respond with success
    console.log("User created with ID:", result.rows[0].id);
    res.status(200).json({ message: "Account created successfully", userId: result.rows[0].id });
  } catch (error) {
    console.error("Error during account creation:", error);
    res.status(500).json({ message: "An error occurred during account creation" });
  }
});

module.exports = router;
