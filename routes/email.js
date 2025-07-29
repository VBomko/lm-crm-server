/**
 * Email Routes
 * 
 * This module defines routes for email-related functionality
 */

const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

/**
 * @route POST /email/welcome
 * @desc Send a welcome email
 * @access Public
 */
router.post('/welcome', emailController.sendWelcomeEmail);

/**
 * @route POST /email/appointment-confirmation
 * @desc Send an appointment confirmation email
 * @access Public
 */
router.post('/appointment-confirmation', emailController.sendAppointmentConfirmation);

/**
 * @route POST /email/change-order
 * @desc Send a change order email to multiple recipients
 * @access Public
 */
router.post('/change-order', emailController.sendChangeOrderEmail);

/**
 * @route POST /email/custom
 * @desc Send a custom email with template
 * @access Public
 */
router.post('/custom', emailController.sendCustomEmail);

module.exports = router;