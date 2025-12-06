const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'CHANGE_ME_DEVELOPMENT_SECRET';

const requireJWTAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    };
    
    next();
  } catch (error) {
    console.error('JWT Auth middleware error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
};

const requireJWTAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Administrative privileges required'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    };
    
    next();
  } catch (error) {
    console.error('JWT Admin middleware error:', error);
    
    let message = 'Invalid or expired token';
    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired. Please log in again.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token format';
    } else if (error.name === 'NotBeforeError') {
      message = 'Token not active yet';
    }
    
    return res.status(401).json({
      error: 'Unauthorized',
      message
    });
  }
};

const requireJWTAdminOrAuthor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }

    if (user.role !== 'admin' && user.role !== 'author') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Administrative or author privileges required'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    };
    
    next();
  } catch (error) {
    console.error('JWT Admin/Author middleware error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
};

module.exports = { requireJWTAuth, requireJWTAdmin, requireJWTAdminOrAuthor };