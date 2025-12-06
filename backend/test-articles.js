const express = require('express');
const mongoose = require('mongoose');
const Article = require('./models/Article');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/student-relief', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Test route to check article fetching with pagination
app.get('/api/articles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Only fetch published articles
    const filter = { status: 'Published' };
    
    // Add search functionality
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title content author imageUrl categories createdAt');
    
    const totalArticles = await Article.countDocuments(filter);
    
    res.json({
      articles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalArticles / limit),
        totalArticles,
        hasNext: page < Math.ceil(totalArticles / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});