require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';

// Validate critical env vars in production
if (nodeEnv === 'production') {
  const required = ['JWT_SECRET', 'DB_PASSWORD', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv,

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'project_o',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // College email domain whitelist — set to empty array to allow all
  // Example: ['.edu', '.ac.in', 'kiit.ac.in', 'iitd.ac.in']
  collegeEmailDomains: process.env.COLLEGE_EMAIL_DOMAINS
    ? process.env.COLLEGE_EMAIL_DOMAINS.split(',')
    : [],

  // Match queue timeout in seconds
  matchTimeout: parseInt(process.env.MATCH_TIMEOUT, 10) || 60,
};
