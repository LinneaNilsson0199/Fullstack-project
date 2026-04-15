const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const registerRoutes = require("./register");

const app = express();
const loginRoutes = require("./login");

app.use(cors());
app.use(express.json());
loginRoutes(app, pool);
registerRoutes(app, pool);

// ROUTES FOR TABLE: USERS
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

app.post("/users", async (req, res) => {
  try {
    const { full_name, email, password_hash, role_id } = req.body;

    const result = await pool.query(
      `
      INSERT INTO users (full_name, email, password_hash, role_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, role_id, created_at;
      `,
      [full_name, email, password_hash, role_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      error: "Failed to create user",
      details: error.message,
    });
  }
});

// ROUTES FOR TABLE: ROLES
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

app.post("/roles", async (req, res) => {
  try {
    const { role_name } = req.body;

    const result = await pool.query(
      `
      INSERT INTO roles (role_name)
      VALUES ($1)
      RETURNING *;
      `,
      [role_name]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({
      error: "Failed to create role",
      details: error.message,
    });
  }
});

// ROUTES FOR TABLE: PARENT_CHILD
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})