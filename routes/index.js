const express = require('express');
const router = express.Router();

// Import route modules
const availabilityRoutes = require('./usersAppointmentsAvailabilitySlots');
const eventRoutes = require('./events'); // Import event routes

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Use route modules
router.use('/sales-rep-availability', availabilityRoutes);
router.use('/events', eventRoutes); // Use event routes

module.exports = router;