import bcrypt from 'bcrypt';

// Example login logic
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Get user from DB
  const user = await db.query('SELECT * FROM headadmin WHERE email = $1', [email]);

  if (user.rows.length === 0) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Compare entered password with stored hash
  const isMatch = await bcrypt.compare(password, user.rows[0].password);

  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  res.json({ message: 'Login successful' });
});
