/**
 * Appointments Routes
 * Handles appointment-related routes
 */

const express = require('express');
const router = express.Router();
const { getUserAppointmentsAvailabilitySlots } = require('../controllers/usersAppointmentsAvailabilitySlotsController');

/**
 * @route   GET /api/availability
 * @desc    Get user appointment availability slots (using query parameter)
 * @access  Public
 */
router.get('/', getUserAppointmentsAvailabilitySlots);

module.exports = router;