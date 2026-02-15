const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Add Stock
router.post(
  '/',
  authenticate,
  authorize("RETAILER"),
  inventoryController.addStock
);

// View Inventory
router.get(
  '/',
  authenticate,
  authorize("RETAILER"),
  inventoryController.getInventory
);

module.exports = router;
