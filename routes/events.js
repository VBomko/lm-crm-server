/**
 * Events Routes
 * Handles event-related CRUD operations
 */

const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Public
 */
router.post('/', eventsController.createEvent);

/**
 * @route   GET /api/events
 * @desc    Get all events
 * @access  Public
 */
router.get('/', eventsController.getAllEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get a single event by ID
 * @access  Public
 */
router.get('/:id', eventsController.getEventById);

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event by ID
 * @access  Public
 */
router.put('/:id', eventsController.updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event by ID
 * @access  Public
 */
router.delete('/:id', eventsController.deleteEvent);

module.exports = router;