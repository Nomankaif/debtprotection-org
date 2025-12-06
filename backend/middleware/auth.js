const { getSession } = require('@auth/express');
const { authConfig } = require('../config/auth');

const requireAuth = async (req, res, next) => {
  try {
    const session = await getSession(req, authConfig);
    
    if (!session || !session.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource'
      });
    }

    req.user = session.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};

module.exports = { requireAuth };