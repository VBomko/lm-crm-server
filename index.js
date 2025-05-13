// Import required packages
const express = require('express');
const cors = require('cors');

// Import application modules
const config = require('./config');
const { logger, notFound, errorHandler } = require('./middleware');
const routes = require('./routes');

// Initialize Express app
const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors({
  origin: config.cors.origin
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the scratch Node.js API',
    environment: config.server.nodeEnv,
    version: config.api.version
  });
});

// API routes
app.use('/', routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running in ${config.server.nodeEnv} mode on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/`);
});