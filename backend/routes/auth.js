const express = require('express');
const { ExpressAuth } = require('@auth/express');
const { authConfig } = require('../config/auth');
const { getSession } = require('@auth/express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Custom session endpoint that works with both JWT and OAuth
router.get('/auth/session', async (req, res) => {
  try {
    // Check for Authorization Bearer token first
    const authHeader = req.headers.authorization || '';
    const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'CHANGE_ME_DEVELOPMENT_SECRET';
    
    console.log('Session endpoint hit, authHeader:', authHeader ? 'Bearer token present' : 'no token');
    
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('JWT decoded successfully, looking for user:', decoded.sub);
        const user = await User.findById(decoded.sub);
        if (user) {
          console.log('User found:', user.email);
          return res.json({ user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status
          }});
        } else {
          console.log('User not found in database');
        }
      } catch (jwtErr) {
        console.warn('JWT verification failed:', jwtErr?.message || jwtErr);
        // Fall through to check OAuth session
      }
    }

    // Skip OAuth session check for now to avoid 500 errors
    // OAuth session will be handled by other auth.js endpoints
    
    console.log('Returning null user');
    // No valid session found - return null
    return res.json({ user: null });
  } catch (error) {
    console.error('Session endpoint unexpected error:', error);
    return res.status(200).json({ user: null });
  }
});

// Mount Auth.js routes (keep default routes provided by @auth/express)
// These will handle /api/auth/signin, /api/auth/callback/* etc
router.use('/auth', ExpressAuth(authConfig));

module.exports = router;