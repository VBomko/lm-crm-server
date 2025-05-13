/**
 * Utility functions
 * Common helper functions used throughout the application
 */

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 15);
};

/**
 * Format date to ISO string
 * @param {Date} date Date to format
 * @returns {string} Formatted date
 */
const formatDate = (date = new Date()) => {
  return date.toISOString();
};

/**
 * Validate email format
 * @param {string} email Email to validate
 * @returns {boolean} Whether email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize object by removing specified fields
 * @param {Object} obj Object to sanitize
 * @param {Array} fields Fields to remove
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj, fields = []) => {
  const sanitized = { ...obj };
  fields.forEach(field => {
    delete sanitized[field];
  });
  return sanitized;
};

/**
 * Paginate array
 * @param {Array} array Array to paginate
 * @param {number} page Page number
 * @param {number} limit Items per page
 * @returns {Object} Paginated result
 */
const paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const results = {
    data: array.slice(startIndex, endIndex),
    pagination: {
      total: array.length,
      page,
      limit,
      pages: Math.ceil(array.length / limit)
    }
  };
  
  if (endIndex < array.length) {
    results.pagination.next = page + 1;
  }
  
  if (startIndex > 0) {
    results.pagination.prev = page - 1;
  }
  
  return results;
};

// Import Supabase clients
const { supabase, supabaseCrmSettings } = require('./supabase');

module.exports = {
  generateId,
  formatDate,
  isValidEmail,
  sanitizeObject,
  paginate,
  supabase,
  supabaseCrmSettings
};