/**
 * Email Service Test Script
 * 
 * This script tests the email service functionality by sending a test email.
 */

// Load environment variables
require('dotenv').config();

// Import the email service
const { emailService } = require('./utils');

// Test function to send a welcome email
async function testWelcomeEmail() {
  try {
    console.log('Sending test welcome email...');
    
    const result = await emailService.sendTemplatedEmail({
      to: 'volodymyr.b@peeklogic.com', // Replace with a real email for actual testing
      subject: 'Welcome to Luxury Makeover - Test',
      templateName: 'welcome',
      templateData: {
        userName: 'Test User',
        link: 'https://crm.luxurymakeover.com/reset-password',
        app : 'CRM'
      }
    });
    
    console.log('Email sent successfully!');
    console.log('Message ID:', result.MessageId);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error.message);
    throw error;
  }
}

// Test function to send an appointment confirmation email
async function testAppointmentEmail() {
  try {
    console.log('Sending test appointment confirmation email...');
    
    const result = await emailService.sendTemplatedEmail({
      to: 'test@example.com', // Replace with a real email for actual testing
      subject: 'Your Appointment Confirmation - Luxury Makeover - Test',
      templateName: 'appointment-confirmation',
      templateData: {
        clientName: 'Test Client',
        appointmentDate: 'June 15, 2025',
        appointmentTime: '2:00 PM',
        serviceName: 'Bathroom Consultation',
        location: '123 Main St, Anytown, USA',
        specialistName: 'Jane Smith',
        rescheduleUrl: 'https://luxurymakeover.com/reschedule',
        calendarLink: 'https://calendar.google.com',
        contactEmail: 'support@luxurymakeover.com',
        contactPhone: '+1 (800) 123-4567',
        year: new Date().getFullYear(),
        address: '123 Luxury Street, Beverly Hills, CA 90210'
      }
    });
    
    console.log('Email sent successfully!');
    console.log('Message ID:', result.MessageId);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error.message);
    throw error;
  }
}

// Execute the tests
async function runTests() {
  try {
    // Uncomment the test you want to run
    await testWelcomeEmail();
    // await testAppointmentEmail();
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
runTests();