const pool = require('../config/db');

function generateClaimCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.createSale = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userId = req.user.userId;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    // Get retailer profile
    const retailerResult = await client.query(
      `SELECT * FROM retailer_profiles WHERE user_id = $1`,
      [userId]
    );

    if (retailerResult.rows.length === 0) {
      return res.status(400).json({ message: "Retailer not found" });
    }

    const retailer = retailerResult.rows[0];

    let totalAmount = 0;

    // Generate unique claim code
    let claimCode;
    let exists = true;

    while (exists) {
      claimCode = generateClaimCode();
      const check = await client.query(
        `SELECT * FROM sales WHERE claim_code = $1`,
        [claimCode]
      );
      if (check.rows.length === 0) exists = false;
    }

    // Create sale
    const saleResult = await client.query(
      `INSERT INTO sales (retailer_id, total_amount, claim_code, is_claimed)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [retailer.id, 0, claimCode, false]
    );

    const sale = saleResult.rows[0];

    // Process each item
    for (let item of items) {
      const { product_id, quantity } = item;

      let remainingQty = quantity;

      // Get FEFO batches
      const batchResult = await client.query(
        `SELECT * FROM batches
         WHERE product_id = $1
         AND retailer_id = $2
         AND quantity_available > 0
         AND expiry_date >= CURRENT_DATE
         ORDER BY expiry_date ASC`,
        [product_id, retailer.id]
      );

      if (batchResult.rows.length === 0) {
        throw new Error("No available stock for product " + product_id);
      }

      for (let batch of batchResult.rows) {
        if (remainingQty <= 0) break;

        const deductQty = Math.min(batch.quantity_available, remainingQty);

        const itemTotal = deductQty * batch.selling_price;
        totalAmount += itemTotal;

        // Insert sale_item
        await client.query(
          `INSERT INTO sale_items
           (sale_id, product_id, batch_id,
            quantity, price_per_unit, total_price,
            mfd_date, expiry_date)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            sale.id,
            product_id,
            batch.id,
            deductQty,
            batch.selling_price,
            itemTotal,
            batch.mfd_date,
            batch.expiry_date
          ]
        );

        // Reduce batch quantity
        await client.query(
          `UPDATE batches
           SET quantity_available = quantity_available - $1
           WHERE id = $2`,
          [deductQty, batch.id]
        );

        remainingQty -= deductQty;
      }

      if (remainingQty > 0) {
        throw new Error("Insufficient stock for product " + product_id);
      }
    }

    // Update total amount
    await client.query(
      `UPDATE sales SET total_amount = $1 WHERE id = $2`,
      [totalAmount, sale.id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: "Sale completed",
      claim_code: claimCode,
      total_amount: totalAmount
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
};
