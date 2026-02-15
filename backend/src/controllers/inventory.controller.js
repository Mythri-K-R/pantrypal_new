const pool = require('../config/db');

/**
 * ➕ Add Stock (Create Batch)
 */
exports.addStock = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      product_id,
      mfd_date,
      expiry_date,
      quantity,
      purchase_price,
      selling_price
    } = req.body;

    if (!product_id || !mfd_date || !expiry_date || !quantity) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (new Date(expiry_date) <= new Date(mfd_date)) {
      return res.status(400).json({ message: "Expiry must be after MFD" });
    }

    // Get retailer profile
    const retailerResult = await pool.query(
      `SELECT * FROM retailer_profiles WHERE user_id = $1`,
      [userId]
    );

    if (retailerResult.rows.length === 0) {
      return res.status(400).json({ message: "Retailer profile not found" });
    }

    const retailer = retailerResult.rows[0];

    const newBatch = await pool.query(
      `INSERT INTO batches
       (product_id, retailer_id, mfd_date, expiry_date,
        quantity_total, quantity_available,
        purchase_price, selling_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        product_id,
        retailer.id,
        mfd_date,
        expiry_date,
        quantity,
        quantity,
        purchase_price || 0,
        selling_price || 0
      ]
    );

    res.status(201).json({
      message: "Stock added successfully",
      batch: newBatch.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * 📦 View Inventory (Retailer Specific)
 */
exports.getInventory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const retailerResult = await pool.query(
      `SELECT * FROM retailer_profiles WHERE user_id = $1`,
      [userId]
    );

    if (retailerResult.rows.length === 0) {
      return res.status(400).json({ message: "Retailer profile not found" });
    }

    const retailer = retailerResult.rows[0];

    const result = await pool.query(
      `SELECT b.*, p.product_name, p.barcode
       FROM batches b
       JOIN products p ON b.product_id = p.id
       WHERE b.retailer_id = $1
       ORDER BY b.expiry_date ASC`,
      [retailer.id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
