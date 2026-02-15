const pool = require('../config/db');

/**
 * 🔍 Search Products (Autocomplete)
 * Query param: ?q=milk
 */
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const result = await pool.query(
      `SELECT * FROM products
       WHERE product_name ILIKE $1
       ORDER BY product_name ASC
       LIMIT 10`,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * 📦 Get Product By Barcode
 */
exports.getByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    const result = await pool.query(
      `SELECT * FROM products WHERE barcode = $1`,
      [barcode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * ➕ Add New Product (If manual entry)
 */
exports.addProduct = async (req, res) => {
  try {
    const { barcode, product_name, brand, category, unit } = req.body;

    if (!product_name) {
      return res.status(400).json({ message: "Product name required" });
    }

    const existing = await pool.query(
      `SELECT * FROM products WHERE barcode = $1`,
      [barcode]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const newProduct = await pool.query(
      `INSERT INTO products (barcode, product_name, brand, category, unit)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [barcode, product_name, brand, category, unit]
    );

    res.status(201).json(newProduct.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
