const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claim.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Claim Purchase
router.post(
  '/',
  authenticate,
  authorize("CUSTOMER"),
  claimController.claimPurchase
);

module.exports = router;
