const express = require("express");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
require("dotenv").config();
const bcrypt = require("bcrypt");

const AhoCorasick = require("./search");
const pool = require("./db");
const { authenticate } = require("./authenticate");

const app = express();

app.use(cors());
app.use(express.json());

function requireAdmin(req, res, next) {
  if (req.user.role_id !== 1) {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

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
app.post("/scan", authenticate, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const text = req.file.buffer.toString("utf8").toLowerCase();
    const scanResult = automaton.search(text);

    await pool.query(
      `
      INSERT INTO scan_results (child_user_id, file_name, detected_text, match_count)
      VALUES ($1, $2, $3, $4);
      `,
      [
        req.user.id,
        req.file.originalname,
        null,
        scanResult.match_count
      ]
    );

    res.json({
      result: scanResult.found ? "not clear" : "clear",
      found: scanResult.found,
      match_count: scanResult.match_count
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
app.get("/users", authenticate, requireAdmin, async (req, res) => {
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

app.put("/users/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { full_name, email, role_id } = req.body;

    const result = await pool.query(
      `
      UPDATE users
      SET full_name = $1, email = $2, role_id = $3
      WHERE id = $4
      RETURNING id, full_name, email, role_id, created_at;
      `,
      [full_name, email, role_id, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.delete("/users/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

app.post("/users", authenticate, requireAdmin, async (req, res) => {
  try {
    const { full_name, email, password, role_id } = req.body;

    if (!full_name || !email || !password || !role_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const password_hash = await bcrypt.hash(password, 10);

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
    res.status(500).json({ error: "Failed to create user" });
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

    if (period === "week") {
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

    let groupBy = "day";

    if (period === "year" || period === "all") {
      groupBy = "week";
    }

    const chartResult = await pool.query(
      `
      SELECT
        DATE_TRUNC('${groupBy}', scan_results.scanned_at) AS date_group,
        COALESCE(SUM(scan_results.match_count), 0) AS bad_words
      FROM scan_results
      JOIN parent_child
        ON scan_results.child_user_id = parent_child.child_user_id
      WHERE parent_child.parent_user_id = $1
        AND scan_results.child_user_id = $2
        ${dateFilter}
      GROUP BY date_group
      ORDER BY date_group;
      `,
      [parentId, childId]
    );
    res.json({
  ...result.rows[0], chart_data: chartResult.rows});
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