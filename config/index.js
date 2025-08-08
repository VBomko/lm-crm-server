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
    origin: process.env.CORS_ORIGIN || true // Allow all origins if CORS_ORIGIN is not set
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  },
  aws: {
    ses: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      senderEmail: process.env.AWS_SES_SENDER_EMAIL,
      senderName: process.env.AWS_SES_SENDER_NAME
    }
  }
};

// Validate required environment variables
const requiredEnvVars = [ 
  'PORT',
  'NODE_ENV',
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_SES_SENDER_EMAIL',
  'AWS_SES_SENDER_NAME'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`Warning: Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = config;