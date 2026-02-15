const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Create Sale
router.post(
  '/',
  authenticate,
  authorize("RETAILER"),
  salesController.createSale
);

module.exports = router;
