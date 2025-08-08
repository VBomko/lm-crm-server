// Import required packages
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import application modules
const config = require('./config');
const { logger, notFound, errorHandler } = require('./middleware');
const routes = require('./routes');

// Initialize Express app
const app = express();
const PORT = config.server.port;

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the scratch Node.js API',
    environment: config.server.nodeEnv,
    version: config.api.version
  });
});

// Test CORS route
app.get('/test-cors', (req, res) => {
  console.log('[test-cors] GET /test-cors called');
  console.log('[test-cors] Request headers:', req.headers);
  res.json({ 
    success: true, 
    message: 'CORS test successful',
    timestamp: new Date().toISOString(),
    headers: req.headers
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