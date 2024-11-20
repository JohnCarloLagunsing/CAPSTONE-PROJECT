const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require('../public/scripts/db'); // Assuming db.js exports a properly configured pool

// Helper function to set session
const setSession = (req, user, role) => {
  req.session.user_id = user.id || user.headadminid; // Use appropriate ID column
  req.session.first_name = user.first_name || user.firstname;
  req.session.last_name = user.last_name || user.lastname;
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

    // Debug: Log input values
    console.log("Login attempt:", { email, password });

    // 1. Check in headadmin table first
    const headadminResult = await pool.query('SELECT * FROM "headadmin" WHERE LOWER(email) = LOWER($1)', [email]);
    if (headadminResult.rows.length > 0) {
      user = headadminResult.rows[0];
      user.firstname = user.firstname?.trim();
      user.lastname = user.lastname?.trim();
      user.email = user.email?.trim();
      user.password = user.password?.trim();
      role = 'headadmin';
    }

    // 2. If not found, check in AdminStaff table
    const adminResult = await pool.query('SELECT * FROM "AdminStaff" WHERE LOWER(email) = LOWER($1)', [email]);
if (adminResult.rows.length > 0) {
  user = adminResult.rows[0];
  user.firstname = user.firstname?.trim();
  user.lastname = user.lastname?.trim();
  user.email = user.email?.trim();
  user.password = user.password?.trim(); // Trim the password to ensure no extra spaces
  role = 'admin';
}


    // 3. If not found, check in users table (applicants)
    if (!user) {
      const userResult = await pool.query('SELECT * FROM "users" WHERE LOWER(email) = LOWER($1)', [email]);
      if (userResult.rows.length > 0) {
        user = userResult.rows[0];
        role = 'applicant';
      }
    }

    // If no user is found
    if (!user) {
      console.log("User not found in any table.");
      return res.status(400).json({ message: "Invalid email and password. Please try again." });
    }

    // Debug: Log fetched user
    console.log("Fetched user data:", user);

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password comparison result:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password. Please try again." });
    }

    // Handle session and redirection for each role
    if (role === 'headadmin') {
      setSession(req, user, role);
      console.log("Headadmin login successful:", user.email);
      return res.status(200).json({ message: "Login successful", redirectUrl: "/HeadDashboard" });
    }

    if (role === 'admin') {
      setSession(req, user, role);
      console.log("Admin login successful:", user.email);
      return res.status(200).json({ message: "Login successful", redirectUrl: "/dashboard" });
    }

    if (role === 'applicant') {
      setSession(req, user, role);

      // Clear occuid to avoid stale data
      req.session.occuid = null;

      console.log(`Checking permit_session for user ID: ${user.id}`);
      const sessionResult = await pool.query("SELECT * FROM permit_session WHERE sid = $1", [user.id]);

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
    return res.status(500).json({ message: "An error occurred during login. Please try again later." });
  }
});

module.exports = router;
