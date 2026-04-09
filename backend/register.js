app.post("/register", async (req, res) => {
  try {
    const { full_name, email, password, role_id } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        error: "full_name, email, and password are required",
      });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "Email already registered",
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await pool.query(
      `
      INSERT INTO users (full_name, email, password_hash, role_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, role_id, created_at;
      `,
      [full_name, email, password_hash, role_id || null]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      error: "Registration failed",
      details: error.message,
    });
  }
});