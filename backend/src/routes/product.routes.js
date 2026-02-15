const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Search products
router.get('/search', authenticate, authorize("RETAILER"), productController.searchProducts);

// Get by barcode
router.get('/barcode/:barcode', authenticate, authorize("RETAILER"), productController.getByBarcode);

// Add new product
router.post('/', authenticate, authorize("RETAILER"), productController.addProduct);

module.exports = router;
