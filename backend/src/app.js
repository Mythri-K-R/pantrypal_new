const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const { authenticate, authorize } = require('./middleware/auth.middleware');
const productRoutes = require('./routes/product.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const salesRoutes = require('./routes/sales.routes');
const claimRoutes = require('./routes/claim.routes');
const customerRoutes = require('./routes/customer.routes');


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/claim', claimRoutes);
app.use('/api/customer', customerRoutes);


// Test Public Route
app.get('/', (req, res) => {
  res.send('PantryPal1 Backend Running');
});

// Protected Retailer Route (Test)
app.get(
  '/api/retailer/dashboard',
  authenticate,
  authorize("RETAILER"),
  (req, res) => {
    res.json({
      message: "Welcome Retailer Dashboard",
      user: req.user
    });
  }
);

// Protected Customer Route (Test)
app.get(
  '/api/customer/home',
  authenticate,
  authorize("CUSTOMER"),
  (req, res) => {
    res.json({
      message: "Welcome Customer Home",
      user: req.user
    });
  }
);

module.exports = app;
