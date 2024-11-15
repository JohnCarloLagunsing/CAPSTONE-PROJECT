const { Pool } = require('pg');

const pool = new Pool({
  user: 'MTOPandOccupationalPermit_owner',
  host: 'ep-crimson-mode-a5iqjgor.us-east-2.aws.neon.tech', // Update this as needed
  database: 'MTOPandOccupationalPermit',
  password: 'v3yCDOfH5mAG',
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  }, // Closing the configuration object
});

module.exports = pool;
