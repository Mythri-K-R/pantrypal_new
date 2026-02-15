const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, phone, password, role, shop_name } = req.body;

    if (!name || !phone || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE phone = $1",
      [phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (name, phone, password_hash)
       VALUES ($1,$2,$3) RETURNING *`,
      [name, phone, hashedPassword]
    );

    const user = newUser.rows[0];

    // If retailer, create retailer profile
    if (role === "RETAILER") {
      if (!shop_name) {
        return res.status(400).json({ message: "Shop name required" });
      }

      await pool.query(
        `INSERT INTO retailer_profiles (user_id, shop_name)
         VALUES ($1,$2)`,
        [user.id, shop_name]
      );
    }

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE phone = $1",
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const retailerCheck = await pool.query(
      "SELECT * FROM retailer_profiles WHERE user_id = $1",
      [user.id]
    );

    const role = retailerCheck.rows.length > 0 ? "RETAILER" : "CUSTOMER";

    const token = jwt.sign(
      { userId: user.id, role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role,
      name: user.name
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
