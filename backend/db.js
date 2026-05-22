const { Pool } = require("pg");
require("dotenv").config();

// USE POOL TO HAVE A REUSABLE GROUP OF OPEN DATABASE CONNECTIONS
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

module.exports = pool;