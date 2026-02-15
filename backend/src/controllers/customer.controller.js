const pool = require('../config/db');

/**
 * 📦 Get My Items
 */
exports.getMyItems = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT 
        ci.id AS customer_item_id,
        ci.status,
        ci.reminder_date,
        ci.reminder_time,
        si.quantity,
        si.price_per_unit,
        si.total_price,
        si.expiry_date,
        p.product_name,
        rp.shop_name
       FROM customer_items ci
       JOIN sale_items si ON ci.sale_item_id = si.id
       JOIN sales s ON si.sale_id = s.id
       JOIN retailer_profiles rp ON s.retailer_id = rp.id
       JOIN products p ON si.product_id = p.id
       WHERE ci.customer_id = $1
       ORDER BY si.expiry_date ASC`,
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * ✅ Mark Item as Used
 */
exports.markAsUsed = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE customer_items
       SET status = 'USED'
       WHERE id = $1 AND customer_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item marked as USED" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * ⏰ Set Reminder
 */
exports.setReminder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { reminder_date, reminder_time } = req.body;

    if (!reminder_date) {
      return res.status(400).json({ message: "Reminder date required" });
    }

    const time = reminder_time || "06:00:00";

    const result = await pool.query(
      `UPDATE customer_items
       SET reminder_date = $1,
           reminder_time = $2
       WHERE id = $3 AND customer_id = $4
       RETURNING *`,
      [reminder_date, time, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Reminder set successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
