const { Pool } = require('pg');

const pool = new Pool({
  user: 'MTOPandOccupationalPermit_owner',
  host: 'ep-crimson-mode-a5iqjgor.us-east-2.aws.neon.tech',
  database: 'MTOPandOccupationalPermit',
  password: 'v3yCDOfH5mAG',
  port: 5432,
  max: 10, // Reduce pool size
  idleTimeoutMillis: 60000, // Close idle clients after 60 seconds
  connectionTimeoutMillis: 20000, // Increase connection timeout to 20 seconds
  ssl: {
    rejectUnauthorized: false, // Disable SSL certificate verification
  },
});


// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
  } else {
    console.log('Database connected:', res.rows[0]);
  }
});

module.exports = pool;
