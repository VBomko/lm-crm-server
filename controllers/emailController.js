/**
 * Email Controller
 * 
 * This controller handles email-related functionality
 */

const { emailService } = require('../utils');

/**
 * Send a welcome email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const sendWelcomeEmail = async (req, res, next) => {
  try {
    const { email, userName ,link , app  } = req.body;

    if (!email || !userName) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    const templateData = {
        userName,
        link,
        app 
    };

    const result = await emailService.sendTemplatedEmail({
      to: email,
      subject: 'Welcome to Luxury Makeover',
      templateName: 'welcome',
      templateData
    });

    res.status(200).json({
      success: true,
      message: 'Welcome email sent successfully',
      data: {
        messageId: result.MessageId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send an appointment confirmation email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const sendAppointmentConfirmation = async (req, res, next) => {
  try {
    const {
      email,
      clientName,
      appointmentDate,
      appointmentTime,
      serviceName,
      location,
      specialistName,
      rescheduleUrl,
      calendarLink,
      contactEmail,
      contactPhone
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'email', 'clientName', 'appointmentDate', 
      'appointmentTime', 'serviceName', 'location'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const templateData = {
      clientName,
      appointmentDate,
      appointmentTime,
      serviceName,
      location,
      specialistName: specialistName || 'Our Specialist',
      rescheduleUrl: rescheduleUrl || 'https://luxurymakeover.com/appointments',
      calendarLink: calendarLink || 'https://luxurymakeover.com/calendar',
      contactEmail: contactEmail || 'support@luxurymakeover.com',
      contactPhone: contactPhone || '+1 (800) 123-4567',
      year: new Date().getFullYear(),
      address: '123 Luxury Street, Beverly Hills, CA 90210'
    };

    const result = await emailService.sendTemplatedEmail({
      to: email,
      subject: 'Your Appointment Confirmation - Luxury Makeover',
      templateName: 'appointment-confirmation',
      templateData
    });

    res.status(200).json({
      success: true,
      message: 'Appointment confirmation email sent successfully',
      data: {
        messageId: result.MessageId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a custom email with template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const sendCustomEmail = async (req, res, next) => {
  try {
    const { 
      to, 
      subject, 
      templateName, 
      templateData,
      from,
      replyTo,
      cc,
      bcc
    } = req.body;

    if (!to || !subject || !templateName || !templateData) {
      return res.status(400).json({
        success: false,
        message: 'To, subject, templateName, and templateData are required'
      });
    }

    const result = await emailService.sendTemplatedEmail({
      to,
      subject,
      templateName,
      templateData,
      from,
      replyTo,
      cc,
      bcc
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: {
        messageId: result.MessageId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a change order email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const sendChangeOrderEmail = async (req, res, next) => {
  try {
    const { emails, customerName, changeOrderUrl } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0 || !customerName || !changeOrderUrl) {
      return res.status(400).json({
        success: false,
        message: 'Emails (array), customer name, and change order URL are required'
      });
    }

    const templateData = {
      customerName,
      changeOrderUrl
    };

    const result = await emailService.sendTemplatedEmail({
      to: emails,
      subject: `${customerName}  please sign this Change Order ASAP`,
      templateName: 'change-order',
      templateData
    });

    res.status(200).json({
      success: true,
      message: 'Change order email sent successfully',
      data: {
        messageId: result.MessageId,
        recipientCount: emails.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendAppointmentConfirmation,
  sendCustomEmail,
  sendChangeOrderEmail
};