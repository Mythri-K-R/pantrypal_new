require('dotenv').config();
const pool = require('../src/config/db');
const bcrypt = require('bcrypt');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFutureDate(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date;
}

function randomPastDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return date;
}

function generateClaimCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function seed() {
  try {
    console.log("Starting full seed...");

    // Clear existing data (safe order)
    await pool.query("DELETE FROM notifications");
    await pool.query("DELETE FROM customer_items");
    await pool.query("DELETE FROM customer_claims");
    await pool.query("DELETE FROM sale_items");
    await pool.query("DELETE FROM sales");
    await pool.query("DELETE FROM batches");
    await pool.query("DELETE FROM products");
    await pool.query("DELETE FROM retailer_profiles");
    await pool.query("DELETE FROM users");

    // Create users
    const users = [
      { name: "Retailer One", phone: "9000000001", password: "ret123" },
      { name: "Retailer Two", phone: "9000000002", password: "ret234" },
      { name: "Customer One", phone: "9000000003", password: "cus345" },
      { name: "Customer Two", phone: "9000000004", password: "cus456" }
    ];

    const createdUsers = [];

    for (let user of users) {
      const hash = await bcrypt.hash(user.password, 10);
      const result = await pool.query(
        `INSERT INTO users (name, phone, password_hash)
         VALUES ($1,$2,$3) RETURNING *`,
        [user.name, user.phone, hash]
      );
      createdUsers.push(result.rows[0]);
    }

    const retailer1 = createdUsers[0];
    const retailer2 = createdUsers[1];
    const customer1 = createdUsers[2];
    const customer2 = createdUsers[3];

    // Create retailer profiles
    const r1 = await pool.query(
      `INSERT INTO retailer_profiles (user_id, shop_name)
       VALUES ($1,$2) RETURNING *`,
      [retailer1.id, "Fresh Mart"]
    );

    const r2 = await pool.query(
      `INSERT INTO retailer_profiles (user_id, shop_name)
       VALUES ($1,$2) RETURNING *`,
      [retailer2.id, "Daily Needs"]
    );

    const retailerProfile1 = r1.rows[0];
    const retailerProfile2 = r2.rows[0];

    // Create 120 products
    for (let i = 1; i <= 120; i++) {
      await pool.query(
        `INSERT INTO products (barcode, product_name, brand, category, unit)
         VALUES ($1,$2,$3,$4,$5)`,
        [
          "100000000" + i,
          "Product " + i,
          "Brand " + randomInt(1, 10),
          "Category " + randomInt(1, 8),
          randomInt(100, 1000) + " g"
        ]
      );
    }

    const products = await pool.query("SELECT * FROM products");

    // Create batches for retailer 1
    for (let i = 0; i < 100; i++) {
      const product = products.rows[randomInt(0, 119)];
      const mfd = randomPastDate(randomInt(10, 60));
      const exp = randomFutureDate(randomInt(-10, 60)); // includes expired

      await pool.query(
        `INSERT INTO batches
        (product_id, retailer_id, mfd_date, expiry_date,
         quantity_total, quantity_available, purchase_price, selling_price)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          product.id,
          retailerProfile1.id,
          mfd,
          exp,
          randomInt(20, 200),
          randomInt(5, 200),
          randomInt(10, 50),
          randomInt(20, 100)
        ]
      );
    }

    // Create 20 unclaimed sales
    for (let i = 0; i < 20; i++) {
      const claimCode = generateClaimCode();

      await pool.query(
        `INSERT INTO sales (retailer_id, total_amount, claim_code, is_claimed)
         VALUES ($1,$2,$3,$4)`,
        [
          retailerProfile1.id,
          randomInt(200, 2000),
          claimCode,
          false
        ]
      );
    }

    console.log("Seed completed successfully!");
    process.exit();

  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
