const express = require('express');
const Article = require('../models/Article');
const Media = require('../models/Media');
const User = require('../models/User');
const {
  normalizeCategoryKey,
  getCategoryQueryValues,
  getCategoryMetadata
} = require('../lib/categoryUtils');
const { requireJWTAuth, requireJWTAdmin, requireJWTAdminOrAuthor } = require('../middleware/jwtAuth');

const router = express.Router();

const buildAbsoluteUrl = (req, rawUrl) => {
  if (!rawUrl) return rawUrl;

  try {
    const trimmedUrl = rawUrl.toString();

    if (/^https?:\/\//i.test(trimmedUrl)) {
      const parsed = new URL(trimmedUrl);
      if (!['localhost', '127.0.0.1'].includes(parsed.hostname)) {
        return trimmedUrl;
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      return `${baseUrl}${parsed.pathname}`;
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}${trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`}`;
  } catch (error) {
    console.warn('Failed to normalize image URL:', rawUrl, error.message);
    return rawUrl;
  }
};

const formatFeaturedImage = (media, req) => {
  if (!media) return media;
  if (media.url) {
    return {
      ...media,
      url: buildAbsoluteUrl(req, media.url)
    };
  }
  return media;
};

// Get posts for admin/author dashboard with filtering and pagination
router.get('/posts', requireJWTAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // If user is not admin, only show their own posts
    if (req.user.role !== 'admin') {
      filter.authorId = req.user.id;
    }
    
    // Apply status filter
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    
    // Apply author filter (admin only)
    if (req.query.author && req.user.role === 'admin') {
      filter.author = req.query.author;
    }
    
    // Apply tag filter
    if (req.query.tag) {
      filter.tags = req.query.tag;
    }
    
    // Apply search
    if (req.query.q) {
      filter.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { content: { $regex: req.query.q, $options: 'i' } },
        { excerpt: { $regex: req.query.q, $options: 'i' } }
      ];
    }
    
    // Fetch posts
    const posts = await Article.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'name email')
      .select('-contentMarkdown') // Exclude markdown content for list view
      .lean();
    
    // Get total count
    const total = await Article.countDocuments(filter);
    
    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      error: 'Failed to fetch posts',
      message: error.message
    });
  }
});

// Get single post by ID for editing
router.get('/posts/:id', requireJWTAuth, async (req, res) => {
  try {
    const post = await Article.findById(req.params.id)
      .populate('authorId', 'name email')
      .populate('featuredImageId');
    
    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }
    
    // Check if user can access this post
    if (req.user.role !== 'admin' && post.authorId?.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own posts'
      });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      error: 'Failed to fetch post',
      message: error.message
    });
  }
});

// Create new post
router.post('/posts', requireJWTAdminOrAuthor, async (req, res) => {
  try {
    const postData = {
      ...req.body,
      authorId: req.user.id,
      author: req.user.name || req.user.email
    };

    // Map frontend 'image' field to Article.imageUrl so posts save the image URL
    if (postData.image) {
      postData.imageUrl = postData.image;
      delete postData.image;
    }

    // Capitalize status if it exists
    if (postData.status) {
      postData.status = postData.status.charAt(0).toUpperCase() + postData.status.slice(1).toLowerCase();
    }

    // Calculate word count and reading time if content is provided
    if (postData.content) {
      const plainText = postData.content.replace(/<[^>]*>/g, '');
      const words = plainText.trim().split(/\s+/).length;
      postData.wordCount = words;
      postData.readingTime = Math.ceil(words / 200); // 200 words per minute
    }

    // Auto-generate excerpt if not provided
    if (!postData.excerpt && postData.content) {
      const plainText = postData.content.replace(/<[^>]*>/g, '');
      postData.excerpt = plainText.substring(0, 200).trim() + (plainText.length > 200 ? '...' : '');
    }

    const post = new Article(postData);
    await post.save();
    
    const populatedPost = await Article.findById(post._id)
      .populate('authorId', 'name email')
      .populate('featuredImageId');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate slug',
        message: 'A post with this slug already exists'
      });
    }
    
    res.status(500).json({
      error: 'Failed to create post',
      message: error.message
    });
  }
});

// Update post
router.put('/posts/:id', requireJWTAuth, async (req, res) => {
  try {
    const post = await Article.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }
    
    // Check if user can edit this post
    if (req.user.role !== 'admin' && post.authorId?.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only edit your own posts'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        if (key === 'status' && typeof req.body[key] === 'string') {
          post[key] = req.body[key].charAt(0).toUpperCase() + req.body[key].slice(1).toLowerCase();
        } else if (key === 'image') {
          // Allow frontend to send 'image' which represents imageUrl
          post.imageUrl = req.body[key];
        } else {
          post[key] = req.body[key];
        }
      }
    });

    // Recalculate word count and reading time if content changed
    if (req.body.content) {
      const plainText = req.body.content.replace(/<[^>]*>/g, '');
      const words = plainText.trim().split(/\s+/).length;
      post.wordCount = words;
      post.readingTime = Math.ceil(words / 200);
    }

    // Auto-generate excerpt if not provided but content changed
    if (!req.body.excerpt && req.body.content) {
      const plainText = req.body.content.replace(/<[^>]*>/g, '');
      post.excerpt = plainText.substring(0, 200).trim() + (plainText.length > 200 ? '...' : '');
    }

    await post.save();
    
    const updatedPost = await Article.findById(post._id)
      .populate('authorId', 'name email')
      .populate('featuredImageId');
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Update post error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate slug',
        message: 'A post with this slug already exists'
      });
    }
    
    res.status(500).json({
      error: 'Failed to update post',
      message: error.message
    });
  }
});

// Publish/unpublish post
router.post('/posts/:id/publish', requireJWTAuth, async (req, res) => {
  try {
    let { status } = req.body;
    
    // Capitalize status
    if (status) {
      status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    const validStatuses = ['Draft', 'Review', 'Scheduled', 'Published', 'Archived'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: ' + validStatuses.join(', ')
      });
    }

    const post = await Article.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }
    
    // Check permissions
    if (req.user.role !== 'admin' && post.authorId?.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only modify your own posts'
      });
    }

    // Authors can only draft or request review, not publish directly
    if (req.user.role === 'author' && status === 'Published') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Authors cannot publish directly. Please submit for review.'
      });
    }

    post.status = status;
    
    // Set published date when publishing
    if (status === 'Published' && !post.publishedAt) {
      post.publishedAt = new Date();
    }
    
    await post.save();
    
    res.json({
      message: `Post ${status.toLowerCase()} successfully`,
      post: {
        id: post._id,
        status: post.status,
        publishedAt: post.publishedAt
      }
    });
  } catch (error) {
    console.error('Publish post error:', error);
    res.status(500).json({
      error: 'Failed to update post status',
      message: error.message
    });
  }
});

// Delete post (soft delete)
router.delete('/posts/:id', requireJWTAuth, async (req, res) => {
  try {
    const post = await Article.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }
    
    // Check permissions
    if (req.user.role !== 'admin' && post.authorId?.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own posts'
      });
    }

    // Delete associated media files if they exist
    if (post.featuredImageId) {
      try {
        await Media.findByIdAndDelete(post.featuredImageId);
        // Also delete the physical file
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '../uploads', post.featuredImageId.filename || post.featuredImageId);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (mediaError) {
        console.warn('Failed to delete associated media:', mediaError);
        // Continue with post deletion even if media deletion fails
      }
    }

    await Article.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Post and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      error: 'Failed to delete post',
      message: error.message
    });
  }
});

// Get post statistics
router.get('/posts/stats/summary', requireJWTAdminOrAuthor, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { authorId: req.user.id };
    
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts
    ] = await Promise.all([
      Article.countDocuments(filter),
      Article.countDocuments({ ...filter, status: 'Published' }),
      Article.countDocuments({ ...filter, status: 'Draft' }),
      Article.countDocuments({ ...filter, status: 'Scheduled' })
    ]);

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      reviewPosts: totalPosts - publishedPosts - draftPosts - scheduledPosts
    });
  } catch (error) {
    console.error('Get post stats error:', error);
    res.status(500).json({
      error: 'Failed to get post statistics',
      message: error.message
    });
  }
});

// Get published articles for public access (home page)
router.get('/published', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Build filter object for published articles only
    const filter = { status: 'Published' };
    
    // Apply category filter
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
    
    // Apply search
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { excerpt: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Fetch published articles
    const posts = await Article.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'name email')
      .select('title excerpt content author authorId imageUrl featuredImageId categories tags publishedAt createdAt readingTime wordCount views isFeatured slug')
      .lean();
    
    // Get total count
    const total = await Article.countDocuments(filter);
    
    // Format posts for frontend consumption
    const formattedPosts = posts.map((post) => {
      const categoryMeta = getCategoryMetadata(post.categories);
      const categories =
        Array.isArray(categoryMeta.values) && categoryMeta.values.length > 0
          ? categoryMeta.values
          : [categoryMeta.label];

      return {
        id: post._id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author || post.authorId?.name || 'Anonymous',
        authorEmail: post.authorId?.email,
        imageUrl: buildAbsoluteUrl(req, post.imageUrl),
        featuredImageId: formatFeaturedImage(post.featuredImageId, req),
        category: categoryMeta.key,
        categoryLabel: categoryMeta.label,
        categories,
        tags: post.tags || [],
        publishedAt: post.publishedAt || post.createdAt,
        readingTime: post.readingTime || 5,
        wordCount: post.wordCount || 0,
        views: post.views || 0,
        isFeatured: post.isFeatured || false,
        slug: post.slug,
        appeal: post.excerpt // For compatibility with frontend search
      };
    });
    
    res.json({
      posts: formattedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get published posts error:', error);
    res.status(500).json({
      error: 'Failed to fetch published posts',
      message: error.message
    });
  }
});

// Get single published post by slug for public access
router.get('/published/:slug', async (req, res) => {
  try {
    const post = await Article.findOneAndUpdate(
      { slug: req.params.slug, status: 'Published' },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('authorId', 'name email')
      .populate('featuredImageId')
      .lean();

    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    const categoryMeta = getCategoryMetadata(post.categories);
    const categories =
      Array.isArray(categoryMeta.values) && categoryMeta.values.length > 0
        ? categoryMeta.values
        : [categoryMeta.label];

    res.json({
      id: post._id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      contentMarkdown: post.contentMarkdown,
      author: post.author || post.authorId?.name || 'Anonymous',
      authorEmail: post.authorId?.email,
      authorId: post.authorId?._id || post.authorId,
      imageUrl: buildAbsoluteUrl(req, post.imageUrl),
      featuredImageId: formatFeaturedImage(post.featuredImageId, req),
      category: categoryMeta.key,
      categoryLabel: categoryMeta.label,
      categories,
      tags: post.tags || [],
      publishedAt: post.publishedAt || post.createdAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      readingTime: post.readingTime || Math.ceil((post.wordCount || 600) / 200),
      wordCount: post.wordCount || 0,
      views: post.views || 0,
      isFeatured: post.isFeatured || false,
      slug: post.slug,
      status: post.status,
      canonicalUrl: post.canonicalUrl,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      allowComments: post.allowComments,
      appeal: post.excerpt
    });
  } catch (error) {
    console.error('Get published post error:', error);
    res.status(500).json({
      error: 'Failed to fetch post',
      message: error.message
    });
  }
});

// Get categories with post counts for public access
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { key: 'all', label: 'All Posts', count: 0 },
      { key: 'admissions', label: 'Admissions', count: 0 },
      { key: 'financial', label: 'Financial Aid', count: 0 },
      { key: 'academics', label: 'Academics', count: 0 },
      { key: 'campus_life', label: 'Campus Life', count: 0 },
      { key: 'career_outcomes', label: 'Career Outcomes', count: 0 },
      { key: 'general', label: 'General', count: 0 }
    ];

    // Get total published posts
    const totalPublished = await Article.countDocuments({ status: 'Published' });
    categories[0].count = totalPublished;

    // Get counts for each category
    const categoryCounts = await Article.aggregate([
      { $match: { status: 'Published' } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } }
    ]);

    // Map counts to category objects
    categoryCounts.forEach((cat) => {
      const categoryKey = normalizeCategoryKey(cat._id, { fallback: null });

      if (categoryKey) {
        const category = categories.find((c) => c.key === categoryKey);
        if (category) {
          category.count = cat.count;
        }
      }
    });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
});

module.exports = router;
