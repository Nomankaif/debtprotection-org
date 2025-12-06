const { getSession } = require('@auth/express');
const { authConfig } = require('../config/auth');

const requireAdmin = async (req, res, next) => {
  try {
    const session = await getSession(req, authConfig);

    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource'
      });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'author') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Administrative privileges required'
      });
    }

    req.user = session.user;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};

module.exports = requireAdmin;