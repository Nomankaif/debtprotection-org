const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Author = require('../models/Author');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'CHANGE_ME_DEVELOPMENT_SECRET';
const TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '24h';

const sanitizeUser = (userDoc) => ({
  id: userDoc.id,
  email: userDoc.email,
  firstName: userDoc.firstName,
  lastName: userDoc.lastName,
  name: userDoc.name,
  role: userDoc.role,
  status: userDoc.status,
  createdAt: userDoc.createdAt,
  updatedAt: userDoc.updatedAt
});

const createToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

router.post('/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role: requestedRole, authorBio } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Invalid payload',
        message: 'Email and password are required'
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 12);

    let user = await User.findOne({ email: normalizedEmail });

    const hasAdmin = await User.exists({ role: 'admin' });
    let role = 'user';
    const normalizedRole = typeof requestedRole === 'string' ? requestedRole.toLowerCase() : null;

    if (normalizedRole === 'admin') {
      if (!hasAdmin) {
        // First account becomes admin automatically
        role = 'admin';
      } else {
        // Allow additional admin accounts to be created without access key
        role = 'admin';
      }
    } else if (normalizedRole === 'author') {
      role = 'author';
    } else if (!hasAdmin) {
      // Ensure first account becomes admin
      role = 'admin';
    }

    if (user) {
      user.firstName = user.firstName || firstName;
      user.lastName = user.lastName || lastName;
      user.passwordHash = hashedPassword;
      if (role === 'admin' && user.role !== 'admin') {
        user.role = 'admin';
      } else if (role === 'author') {
        user.role = 'author';
      } else if (!user.role) {
        user.role = 'user';
      }
      user = await user.save();
    } else {
      user = await User.create({
        firstName,
        lastName,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role
      });
    }

    if (role === 'author' && (firstName || lastName)) {
      try {
        const name = `${firstName} ${lastName}`.trim();
        if (name.length > 0) {
          const update = { name };
          if (authorBio && String(authorBio).trim().length > 0) {
            update.bio = String(authorBio).trim();
          }
          await Author.findOneAndUpdate(
            { name },
            update,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
      } catch (authorError) {
        console.warn('Failed to sync author profile:', authorError);
      }
    }

    const token = createToken(user);

    res.status(201).json({
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Account exists',
        message: 'An account with that email already exists'
      });
    }
    res.status(500).json({
      error: 'Registration failed',
      message: 'Unable to create account right now'
    });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Invalid payload',
        message: 'Email and password are required'
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Check your email and password, then try again'
      });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Check your email and password, then try again'
      });
    }

    if (user.role !== 'admin' && user.role !== 'author') {
      return res.status(403).json({
        error: 'Forbidden',
        message: "You don't have permission to access the admin panel."
      });
    }

    const token = createToken(user);

    res.json({
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'Unable to sign in right now'
    });
  }
});

// Verify token and return sanitized user (for frontend token-based flows)
router.get('/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Auth me error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

router.get('/local/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Local auth service online'
  });
});

module.exports = router;