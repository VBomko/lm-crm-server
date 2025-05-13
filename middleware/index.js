/**
 * Middleware index
 * Exports all middleware from a single location
 */

const logger = require('./logger.middleware');
const { notFound, errorHandler } = require('./error.middleware');

module.exports = {
  logger,
  notFound,
  errorHandler
};