const bcrypt = require("bcrypt");
const { createToken } = require("./authenticate");

module.exports = (app, pool) => {
  app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: "Email and password are required",
        });
      }

      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      const user = result.rows[0];

      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      const token = createToken(user);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role_id: user.role_id,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        error: "Login failed",
        details: error.message,
      });
    }
  });
};