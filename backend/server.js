const express = require("express");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
require("dotenv").config();

const AhoCorasick = require("./search");
const pool = require("./db");
const { authenticate } = require("./authenticate");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const words = fs
  .readFileSync("words.txt", "utf8")
  .split(/\r?\n/)
  .map(word => word.trim().toLowerCase())
  .filter(word => word.length > 0);

const automaton = new AhoCorasick(words);

// Public routes
require("./login")(app, pool);
require("./register")(app, pool);

// Protected routes

// FILE SCAN
app.post("/scan", authenticate, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const text = req.file.buffer.toString("utf8").toLowerCase();
    const found = automaton.search(text);

    res.json({
      result: found ? "not clear" : "clear",
      found,
    });
  } catch (error) {
    console.error("Error scanning file:", error);
    res.status(500).json({
      error: "Failed to scan file",
      details: error.message,
    });
  }
});

// USERS
app.get("/users", authenticate, async (req, res) => {
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
app.get("/roles", authenticate, async (req, res) => {
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
app.get("/parent-child", authenticate, async (req, res) => {
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

app.post("/parent-child/add-email", authenticate, async (req, res) => {
  try {
    const parentId = req.user.id;
    const { childEmail } = req.body;

    if (!childEmail) {
      return res.status(400).json({ error: "Child email is required" });
    }

    const childResult = await pool.query(
      `
      SELECT users.id, users.email, roles.role_name
      FROM users
      JOIN roles ON users.role_id = roles.id
      WHERE users.email = $1
      `,
      [childEmail]
    );

    if (childResult.rows.length === 0) {
      return res.status(404).json({ error: "Child user not found" });
    }

    const child = childResult.rows[0];

    if (child.role_name !== "child") {
      return res.status(400).json({ error: "This user is not registered as a child" });
    }

    const existingRelation = await pool.query(
      `
      SELECT id FROM parent_child
      WHERE parent_user_id = $1 AND child_user_id = $2
      `,
      [parentId, child.id]
    );

    if (existingRelation.rows.length > 0) {
      return res.status(409).json({ error: "Child is already connected to this parent" });
    }

    const result = await pool.query(
      `
      INSERT INTO parent_child (parent_user_id, child_user_id)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [parentId, child.id]
    );

    res.status(201).json({
      message: "Child connected successfully",
      relation: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to connect child",
      details: error.message,
    });
  }
});

app.get("/my-children", authenticate, async (req, res) => {
  try {
    const parentId = req.user.id;

    const result = await pool.query(
      `
      SELECT users.id, users.full_name, users.email
      FROM parent_child
      JOIN users ON parent_child.child_user_id = users.id
      WHERE parent_child.parent_user_id = $1
      `,
      [parentId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch children"
    });
  }
});

// CHILD STATISTICS
app.get("/statistics/child/:childId", authenticate, async (req, res) => {
  try {
    const parentId = req.user.id;
    const { childId } = req.params;
    const { period } = req.query;

    let dateFilter = "";

    if (period === "day") {
      dateFilter = "AND scan_results.scanned_at >= NOW() - INTERVAL '1 day'";
    } else if (period === "week") {
      dateFilter = "AND scan_results.scanned_at >= NOW() - INTERVAL '7 days'";
    } else if (period === "year") {
      dateFilter = "AND scan_results.scanned_at >= NOW() - INTERVAL '1 year'";
    }

    const result = await pool.query(
      `
      SELECT
        COUNT(scan_results.id) AS total_scans,
        COALESCE(SUM(scan_results.match_count), 0) AS total_bad_words,
        COUNT(*) FILTER (WHERE scan_results.severity = 'low') AS low_count,
        COUNT(*) FILTER (WHERE scan_results.severity = 'medium') AS medium_count,
        COUNT(*) FILTER (WHERE scan_results.severity = 'high') AS high_count
      FROM scan_results
      JOIN parent_child
        ON scan_results.child_user_id = parent_child.child_user_id
      WHERE parent_child.parent_user_id = $1
        AND scan_results.child_user_id = $2
        ${dateFilter};
      `,
      [parentId, childId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch statistics",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 4000;

process.on("uncaughtException", err => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", reason => {
  console.error("Unhandled rejection:", reason);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});