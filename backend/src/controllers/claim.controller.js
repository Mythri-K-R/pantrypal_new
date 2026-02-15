const pool = require('../config/db');

exports.claimPurchase = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userId = req.user.userId;
    const { claim_code } = req.body;

    if (!claim_code) {
      return res.status(400).json({ message: "Claim code required" });
    }

    // Check sale exists
    const saleResult = await client.query(
      `SELECT * FROM sales WHERE claim_code = $1`,
      [claim_code]
    );

    if (saleResult.rows.length === 0) {
      throw new Error("Invalid claim code");
    }

    const sale = saleResult.rows[0];

    if (sale.is_claimed) {
      throw new Error("This purchase has already been claimed");
    }

    // Insert into customer_claims
    await client.query(
      `INSERT INTO customer_claims (sale_id, customer_id)
       VALUES ($1,$2)`,
      [sale.id, userId]
    );

    // Get all sale items
    const saleItemsResult = await client.query(
      `SELECT * FROM sale_items WHERE sale_id = $1`,
      [sale.id]
    );

    const saleItems = saleItemsResult.rows;

    // Insert into customer_items
    for (let item of saleItems) {
      await client.query(
        `INSERT INTO customer_items
         (customer_id, sale_item_id, status)
         VALUES ($1,$2,$3)`,
        [userId, item.id, "ACTIVE"]
      );
    }

    // Mark sale as claimed
    await client.query(
      `UPDATE sales SET is_claimed = TRUE WHERE id = $1`,
      [sale.id]
    );

    await client.query('COMMIT');

    res.json({
      message: "Purchase claimed successfully",
      items_count: saleItems.length
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
};
