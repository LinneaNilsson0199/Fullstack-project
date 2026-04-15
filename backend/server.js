const express = require("express");
const cors = require("cors");
require("dotenv").config();

console.log("THIS server.js is running");

const app = express();
const pool = require("./db");

app.use(cors());
app.use(express.json());

// Load route modules
require("./login")(app, pool);
require("./register")(app, pool);

// Simple test route
app.get("/", (req, res) => {
  res.send("API is running");
});

// USERS
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, full_name, email, role_id, created_at
      FROM users
      ORDER BY id;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      error: "Failed to fetch users",
      details: error.message,
    });
  }
});

// ROLES
app.get("/roles", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM roles
      ORDER BY id;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      error: "Failed to fetch roles",
      details: error.message,
    });
  }
});

// PARENT_CHILD
app.get("/parent-child", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM parent_child
      ORDER BY id;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching parent_child:", error);
    res.status(500).json({
      error: "Failed to fetch parent_child",
      details: error.message,
    });
  }
});

app.post("/parent-child", async (req, res) => {
  try {
    const { parent_id, child_id } = req.body;

    const result = await pool.query(
      `
      INSERT INTO parent_child (parent_id, child_id)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [parent_id, child_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating parent_child row:", error);
    res.status(500).json({
      error: "Failed to create parent_child row",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 4000;

process.on("exit", (code) => {
  console.log("Node process exiting with code:", code);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});