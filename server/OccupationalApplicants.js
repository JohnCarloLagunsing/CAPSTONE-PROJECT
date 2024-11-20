const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../public/scripts/db"); // Assuming db.js exports a properly configured pool

// Helper function to set session
const setSession = (req, user, role) => {
  req.session.user_id = user.id || user.headadminid; // Use appropriate ID column
  req.session.first_name = user.firstname || user.first_name;
  req.session.last_name = user.lastname || user.last_name;
  req.session.role = role;
  req.session.is_logged_in = true;

  console.log(`Session set for ${role}:`, {
    user_id: req.session.user_id,
    role: req.session.role,
    first_name: req.session.first_name,
    last_name: req.session.last_name,
  });
};

// Login route
router.post("/login", async (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    let user = null;
    let role = null;

    console.log("Login attempt:", { email });

    // 1. Check in headadmin table
    const headadminResult = await pool.query(
      'SELECT * FROM "headadmin" WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    if (headadminResult.rows.length > 0) {
      user = headadminResult.rows[0];
      role = "headadmin";
    }

    // 2. Check in AdminStaff table
    if (!user) {
      const adminResult = await pool.query(
        'SELECT * FROM "AdminStaff" WHERE LOWER(email) = LOWER($1)',
        [email]
      );
      if (adminResult.rows.length > 0) {
        user = adminResult.rows[0];
        role = "admin";
      }
    }

    // 3. Check in users table (applicants)
    if (!user) {
      const userResult = await pool.query(
        'SELECT * FROM "users" WHERE LOWER(email) = LOWER($1)',
        [email]
      );
      if (userResult.rows.length > 0) {
        user = userResult.rows[0];
        role = "applicant";
      }
    }

    // If no user is found
    if (!user) {
      console.log("User not found in any table.");
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Clean user fields to remove trailing spaces
    user.firstname = user.firstname?.trim();
    user.lastname = user.lastname?.trim();
    user.email = user.email?.trim();
    user.password = user.password?.trim();
    user.role = user.role?.trim();

    // Debug fetched user data
    console.log("Fetched user data:", user);

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password comparison result:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password. Please try again." });
    }

    // Handle session and redirection for each role
    setSession(req, user, role);

    if (role === "headadmin") {
      console.log("Headadmin login successful:", user.email);
      return res.status(200).json({
        message: "Login successful",
        redirectUrl: "/HeadDashboard.html",
      });
    }

    if (role === "admin") {
      console.log("Admin login successful:", user.email);
      return res.status(200).json({
        message: "Login successful",
        redirectUrl: "/dashboard.html",
      });
    }

    if (role === "applicant") {
      req.session.occuid = null; // Clear any stale occuid

      console.log(`Checking permit_session for user ID: ${user.id}`);
      const sessionResult = await pool.query(
        "SELECT * FROM permit_session WHERE sid = $1",
        [user.id]
      );

      if (sessionResult.rows.length === 0) {
        // Create a new session in permit_session
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // Session expires in 1 hour

        console.log("Creating new permit_session for applicant...");
        await pool.query(
          "INSERT INTO permit_session (sid, sess, expire, has_submitted) VALUES ($1, $2, $3, FALSE)",
          [user.id, JSON.stringify({}), expiresAt]
        );

        console.log("Applicant login successful (first-time):", user.email);
        return res.status(200).json({
          message: "Login successful",
          redirectUrl: "/applicantdashboard.html",
          isFirstTime: true,
        });
      } else {
        console.log("Applicant login successful (existing session):", user.email);
        return res.status(200).json({
          message: "Login successful",
          redirectUrl: "/occustatus.html",
          isFirstTime: false,
        });
      }
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      message: "An error occurred during login. Please try again later.",
    });
  }
});

module.exports = router;
