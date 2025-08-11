import bcrypt from 'bcrypt';

if (storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2a$')) {
    // Compare using bcrypt
    const match = await bcrypt.compare(inputPassword, storedPassword);
    if (!match) return res.status(401).send('Invalid credentials');
} else {
    // Compare plain text
    if (inputPassword !== storedPassword) {
        return res.status(401).send('Invalid credentials');
    }
}
