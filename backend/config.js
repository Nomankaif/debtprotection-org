// Configuration file for environment variables
const config = {
  // MongoDB Configuration
  MONGO_DB_URL: process.env.MONGO_DB_URL || 'mongodb://localhost:27017/blogs',
  
  // Server Configuration  
  PORT: process.env.PORT || 5011,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-student-relief-app',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // Session Configuration
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-super-secret-session-key-for-student-relief-app',
  
  // Email Configuration (if needed for notifications)
  EMAIL_USER: process.env.EMAIL_USER || 'your-email@example.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'your-email-password',
  
  // Frontend URL (for CORS)
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
};

module.exports = config;