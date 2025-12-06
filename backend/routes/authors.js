const express = require('express');
const Author = require('../models/Author');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all authors
router.get('/authors', requireAuth, async (req, res) => {
  try {
    const authors = await Author.find().sort({ createdAt: -1 });
    res.json(authors);
  } catch (error) {
    console.error('Get authors error:', error);
    res.status(500).json({
      error: 'Failed to fetch authors',
      message: error.message
    });
  }
});

// Create a new author
router.post('/authors', requireAuth, async (req, res) => {
  try {
    const { name, bio } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Author name is required'
      });
    }

    const author = new Author({
      name: name.trim(),
      bio: bio ? bio.trim() : undefined
    });

    await author.save();
    
    res.status(201).json({
      success: true,
      author,
      message: 'Author created successfully'
    });
  } catch (error) {
    console.error('Create author error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate error',
        message: 'Author with this name already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to create author',
      message: error.message
    });
  }
});

module.exports = router;