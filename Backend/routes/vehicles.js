const express = require('express');
const router = express.Router();

// @route   GET /api/vehicles/test
// @desc    Test vehicles route
// @access  Public
router.get('/test', (req, res) => {
  res.json({ message: 'Vehicles route is working' });
});

// TODO: Implement vehicle routes
// - GET /api/vehicles
// - GET /api/vehicles/:id
// - POST /api/vehicles
// - PUT /api/vehicles/:id
// - DELETE /api/vehicles/:id

module.exports = router;

