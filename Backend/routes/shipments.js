const express = require('express');
const router = express.Router();

// @route   GET /api/shipments/test
// @desc    Test shipments route
// @access  Public
router.get('/test', (req, res) => {
  res.json({ message: 'Shipments route is working' });
});

// TODO: Implement shipment routes
// - GET /api/shipments
// - GET /api/shipments/:id
// - POST /api/shipments
// - PUT /api/shipments/:id
// - DELETE /api/shipments/:id

module.exports = router;

