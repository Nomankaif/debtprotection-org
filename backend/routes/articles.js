const express = require('express');
const Article = require('../models/Article');
const Author = require('../models/Author');
const {
  normalizeCategoryKey,
  getCategoryQueryValues,
  getCategoryMetadata
} = require('../lib/categoryUtils');
const { requireJWTAuth, requireJWTAdmin } = require('../middleware/jwtAuth');

const router = express.Router();

// Get all articles with pagination and filtering
router.get('/articles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Only fetch published articles for public access
    const filter = { status: 'Published' };
    
    // Add search functionality if query param exists
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Add category filtering if query param exists
    if (req.query.category) {
      const normalizedCategory = normalizeCategoryKey(req.query.category, {
        allowAll: true,
        fallback: 'all'
      });

      if (normalizedCategory && normalizedCategory !== 'all') {
        const categoryValues = getCategoryQueryValues(normalizedCategory);

        if (categoryValues.length > 0) {
          filter.categories = { $in: categoryValues };
        }
      }
    }
    
    // Fetch articles with pagination
    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title excerpt content author imageUrl categories createdAt publishedAt slug readingTime wordCount views isFeatured tags') // Select only needed fields
      .lean(); // Use lean() for better performance
    
    // Get total count for pagination
    const totalArticles = await Article.countDocuments(filter);
    
    const formattedArticles = articles.map((article) => {
      const categoryMeta = getCategoryMetadata(article.categories);
      const categories =
        Array.isArray(categoryMeta.values) && categoryMeta.values.length > 0
          ? categoryMeta.values
          : [categoryMeta.label];

      return {
        id: article._id,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        author: article.author,
        imageUrl: article.imageUrl,
        category: categoryMeta.key,
        categoryLabel: categoryMeta.label,
        categories,
        createdAt: article.createdAt,
        publishedAt: article.publishedAt,
        slug: article.slug,
        readingTime: article.readingTime,
        wordCount: article.wordCount,
        views: article.views,
        isFeatured: article.isFeatured,
        tags: article.tags || []
      };
    });

    res.json({
      articles: formattedArticles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalArticles / limit),
        totalArticles,
        hasNext: page < Math.ceil(totalArticles / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      error: 'Failed to fetch articles',
      message: error.message
    });
  }
});

// Get single article (publicly accessible)
router.get('/articles/:slug', async (req, res) => {
  try {
    // Only fetch published articles for public access
    const article = await Article.findOne({
      slug: req.params.slug,
      status: 'Published'
    })
      .select('title slug excerpt content contentMarkdown author authorId imageUrl featuredImageId categories tags status publishedAt scheduledAt readingTime wordCount views allowComments isFeatured seoTitle seoDescription canonicalUrl socialImage createdAt updatedAt')
      .lean(); // Use lean() for better performance

    if (!article) {
      return res.status(404).json({
        error: 'Article not found',
        message: 'The requested article does not exist'
      });
    }

    const recommendedLimit = 4;

    let recommendations = await Article.find({
      _id: { $ne: article._id },
      status: 'Published',
      categories: { $in: article.categories }
    })
      .sort({ createdAt: -1 })
      .limit(recommendedLimit)
      .select('title author imageUrl categories createdAt slug')
      .lean();

    if (recommendations.length < recommendedLimit) {
      const excludedIds = recommendations.map((item) => item._id);
      excludedIds.push(article._id);

      const additionalArticles = await Article.find({
        _id: { $nin: excludedIds },
        status: 'Published'
      })
        .sort({ createdAt: -1 })
        .limit(recommendedLimit - recommendations.length)
        .select('title author imageUrl categories createdAt slug')
        .lean();

      recommendations = recommendations.concat(additionalArticles);
    }

    res.json({
      ...article,
      recommendations
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      error: 'Failed to fetch article',
      message: error.message
    });
  }
});

// Create a new article
router.post('/articles', requireJWTAdmin, async (req, res) => {
  try {
    const { title, content, authorName, imageUrl, categories, status } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title is required'
      });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Content is required'
      });
    }

    if (!authorName || authorName.trim() === '') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Author name is required'
      });
    }

    if (!imageUrl) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Image URL is required'
      });
    }

    if (!categories || categories.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'At least one category is required'
      });
    }

    const article = new Article({
      title: title.trim(),
      content: content.trim(),
      author: authorName.trim(),
      imageUrl,
      categories,
      status: status || 'Draft'
    });

    await article.save();
    
    res.status(201).json({
      success: true,
      article,
      message: 'Article created successfully'
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({
      error: 'Failed to create article',
      message: error.message
    });
  }
});

// Update an article
router.put('/articles/:id', requireJWTAdmin, async (req, res) => {
  try {
    const { title, content, authorName, imageUrl, categories, status } = req.body;

    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found',
        message: 'The requested article does not exist'
      });
    }

    // Validation
    if (title !== undefined && (!title || title.trim() === '')) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title cannot be empty'
      });
    }

    if (content !== undefined && (!content || content.trim() === '')) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Content cannot be empty'
      });
    }

    if (authorName !== undefined && (!authorName || authorName.trim() === '')) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Author name cannot be empty'
      });
    }

    // Update fields if provided
    if (title !== undefined) article.title = title.trim();
    if (content !== undefined) article.content = content.trim();
    if (authorName !== undefined) article.author = authorName.trim();
    if (imageUrl !== undefined) article.imageUrl = imageUrl;
    if (categories !== undefined) article.categories = categories;
    if (status !== undefined) article.status = status;

    await article.save();
    
    res.json({
      success: true,
      article,
      message: 'Article updated successfully'
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({
      error: 'Failed to update article',
      message: error.message
    });
  }
});

// Delete an article
router.delete('/articles/:id', requireJWTAdmin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found',
        message: 'The requested article does not exist'
      });
    }

    await Article.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({
      error: 'Failed to delete article',
      message: error.message
    });
  }
});

module.exports = router;
