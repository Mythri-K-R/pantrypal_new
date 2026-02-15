const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Get my items
router.get(
  '/items',
  authenticate,
  authorize("CUSTOMER"),
  customerController.getMyItems
);

// Mark item as used
router.put(
  '/items/:id/use',
  authenticate,
  authorize("CUSTOMER"),
  customerController.markAsUsed
);

// Set reminder
router.put(
  '/items/:id/reminder',
  authenticate,
  authorize("CUSTOMER"),
  customerController.setReminder
);

module.exports = router;
