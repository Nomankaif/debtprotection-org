const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import database connection and models
const connectDB = require('./config/database');
require('./models/User');
require('./models/Account');
require('./models/Author');
require('./models/Article');
require('./models/Media');

// Import routes
const authRoutes = require('./routes/auth');
const localAuthRoutes = require('./routes/localAuth');
const uploadRoutes = require('./routes/upload');
const authorRoutes = require('./routes/authors');
const articleRoutes = require('./routes/articles');
const adminRoutes = require('./routes/admin');
const postsRoutes = require('./routes/posts');
const mediaRoutes = require('./routes/media');

const app = express();
const PORT = process.env.PORT || 5011;

// Connect to database
connectDB();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
const allowedOrigins = [
  'https://debtprotection.org',
  'https://www.debtprotection.org',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow no-origin (like server-to-server, curl, health checks)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'Cache-Control',
      'Pragma',
      'Expires',
    ],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 🔍 DEBUG: log every incoming request so we see what URL hits via nginx
app.use((req, res, next) => {
  console.log('[BLOG BACKEND]', req.method, req.originalUrl);
  next();
});

// Static files - serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api', localAuthRoutes);
app.use('/api', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api', authorRoutes);
app.use('/api', articleRoutes);
app.use('/api', adminRoutes);
app.use('/api', postsRoutes);
app.use('/api', mediaRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Multer error handling
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      message: 'Please upload an image smaller than 5MB',
    });
  }

  if (error.message === 'Not an image! Please upload only images.') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Please upload only image files',
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : error.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints available at http://localhost:${PORT}/api/auth/*`);
});
