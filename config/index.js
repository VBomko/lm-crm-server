const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  api: {
    version: process.env.API_VERSION || 'v1'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'SUPABASE_URL',
  'SUPABASE_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`Warning: Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = config;