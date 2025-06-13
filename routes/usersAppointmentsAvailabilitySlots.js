/**
 * Appointments Routes
 * Handles appointment-related routes
 */

const express = require('express');
const router = express.Router();
const {
  getUserAppointmentsAvailabilitySlots,
  getUserAppointmentsAvailabilitySlotsForDay
} = require('../controllers/usersAppointmentsAvailabilitySlotsController');

/**
 * @route   GET /api/sales-rep-availability/current-week
 * @desc    Get user appointment availability slots for the current week
 * @access  Public
 */
router.get('/current-week', getUserAppointmentsAvailabilitySlots);

/**
 * @route   GET /api/sales-rep-availability/day=:day
 * @desc    Get user appointment availability slots for a specific day (format: 2025-06-12)
 * @access  Public
 */
router.get('/day=:day', getUserAppointmentsAvailabilitySlotsForDay);

/**
 * @route   GET /api/sales-rep-availability/
 * @desc    Backward compatibility route - redirects to current-week
 * @access  Public
 */
router.get('/', (req, res) => {
  // For backward compatibility, redirect to current-week
  res.redirect('/api/sales-rep-availability/current-week');
});

module.exports = router;