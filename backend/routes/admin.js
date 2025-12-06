const express = require('express');
const Article = require('../models/Article');
const Author = require('../models/Author');
const User = require('../models/User');
const Account = require('../models/Account');
const { requireJWTAdmin, requireJWTAuth, requireJWTAdminOrAuthor } = require('../middleware/jwtAuth');

const router = express.Router();



router.get('/admin/stats', requireJWTAdminOrAuthor, async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      publishedArticles,
      draftArticles,
      authorCount,
      linkedAccounts
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Article.countDocuments({ status: 'Published' }),
      Article.countDocuments({ status: 'Draft' }),
      Author.countDocuments(),
      Account.countDocuments()
    ]);

    const completionRate =
      publishedArticles + draftArticles === 0
        ? 0
        : Math.round(
            (publishedArticles / (publishedArticles + draftArticles)) * 100
          );

    const engagementRate =
      totalUsers === 0
        ? 0
        : Math.round(((activeUsers || 0) / totalUsers) * 100);

    const fundingSecured =
      publishedArticles * 15000 + linkedAccounts * 320 + activeUsers * 180;

    res.json({
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      publishedArticles,
      draftArticles,
      authorCount,
      linkedAccounts,
      fundingSecured,
      completionRate,
      engagementRate
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      error: 'Failed to load stats'
    });
  }
});

router.get('/admin/sales-over-time', requireJWTAdmin, async (req, res) => {
  try {
    const monthsBack = 11;
    const fromDate = new Date();
    fromDate.setUTCMonth(fromDate.getUTCMonth() - monthsBack);
    fromDate.setUTCDate(1);
    fromDate.setUTCHours(0, 0, 0, 0);

    const activity = await Article.aggregate([
      {
        $match: {
          createdAt: { $gte: fromDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          published: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Published'] }, 1, 0]
            }
          },
          drafts: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    const points = [];
    const current = new Date(fromDate);
    const now = new Date();

    while (
      current.getUTCFullYear() < now.getUTCFullYear() ||
      (current.getUTCFullYear() === now.getUTCFullYear() &&
        current.getUTCMonth() <= now.getUTCMonth())
    ) {
      const year = current.getUTCFullYear();
      const month = current.getUTCMonth() + 1;
      const match = activity.find(
        (item) => item._id.year === year && item._id.month === month
      );

      const published = match ? match.published : 0;
      const drafts = match ? match.drafts : 0;
      const total = published + drafts;
      const projected = Math.round(published * 1.25 + drafts * 0.6) + 8;

      points.push({
        label: new Date(Date.UTC(year, month - 1))
          .toLocaleString('default', { month: 'short' })
          .toUpperCase(),
        contributions: total * 1200 + published * 3500,
        approvals: published * 1200,
        projection: projected * 1200
      });

      current.setUTCMonth(current.getUTCMonth() + 1);
    }

    res.json(points);
  } catch (error) {
    console.error('Admin sales-over-time error:', error);
    res.status(500).json({
      error: 'Failed to load sales trend data'
    });
  }
});

router.get('/admin/recent-activities', requireJWTAdmin, async (req, res) => {
  try {
    const [latestArticles, latestUsers] = await Promise.all([
      Article.find({})
        .sort({ createdAt: -1 })
        .limit(12)
        .populate('author', 'name'),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(12)
    ]);

    const articleActivities = latestArticles.map((article) => ({
      id: article.id,
      type: article.status === 'Published' ? 'Published' : 'Draft updated',
      title: article.title,
      actor: article.author ? article.author.name : 'Editorial team',
      timestamp: article.createdAt,
      meta: {
        status: article.status,
        publishDate: article.publishDate
      }
    }));

    const userActivities = latestUsers.map((user) => ({
      id: user.id,
      type: 'New signup',
      title: user.name || 'Invited user',
      actor: user.email,
      timestamp: user.createdAt,
      meta: {
        role: user.role || 'user'
      }
    }));

    const combined = [...articleActivities, ...userActivities]
      .sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    res.json(
      combined.map((item) => ({
        ...item,
        timestamp: item.timestamp
      }))
    );
  } catch (error) {
    console.error('Admin recent-activities error:', error);
    res.status(500).json({
      error: 'Failed to load recent activities'
    });
  }
});

router.get('/admin/top-performing', requireJWTAdmin, async (req, res) => {
  try {
    const top = await Article.aggregate([
      {
        $match: { status: 'Published' }
      },
      {
        $group: {
          _id: '$author',
          published: { $sum: 1 },
          latestPublished: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'authors',
          localField: '_id',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      {
        $sort: {
          published: -1,
          latestPublished: -1
        }
      },
      { $limit: 6 }
    ]);

    const formatted = top.map((entry) => ({
      id: entry._id,
      name: entry.author.name,
      bio: entry.author.bio,
      published: entry.published,
      latestPublished: entry.latestPublished,
      momentum: Math.min(100, entry.published * 11 + 34)
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Admin top-performing error:', error);
    res.status(500).json({
      error: 'Failed to load top performing list'
    });
  }
});

router.get('/admin/users', requireJWTAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      error: 'Failed to load users'
    });
  }
});

router.get('/admin/profile', requireJWTAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ error: 'Failed to fetch admin profile' });
  }
});

router.put('/admin/profile', requireJWTAdmin, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Admin profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.patch('/admin/users/:id/role', requireJWTAdmin, async (req, res) => {
  try {
    const { role, authorBio } = req.body;
    const allowedRoles = ['admin', 'author', 'user'];
    const userId = req.params.id;

    // Validate ObjectId format
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a valid MongoDB ObjectId'
      });
    }

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: 'Role must be one of admin, author, or user'
      });
    }

    if (req.user.id === userId && role !== 'admin') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'You cannot change your own role to a non-admin account.'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    if (user.role === 'admin' && role !== 'admin') {
      const remainingAdmins = await User.countDocuments({
        role: 'admin',
        _id: { $ne: user.id }
      });
      if (remainingAdmins === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'At least one admin is required. Assign another admin before changing this role.'
        });
      }
    }

    user.role = role;
    await user.save();

    if (role === 'author' && user.name) {
      try {
        const trimmedName = user.name.trim();
        if (trimmedName.length > 0) {
          const update = { name: trimmedName };
          if (authorBio && String(authorBio).trim().length > 0) {
            update.bio = String(authorBio).trim();
          }
          await Author.findOneAndUpdate(
            { name: trimmedName },
            update,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
      } catch (authorError) {
        console.warn('Failed to sync author profile during role update:', authorError);
      }
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Admin update user role error:', error);
    
    let message = 'Failed to update user role';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      message = 'Invalid user data: ' + Object.values(error.errors).map(e => e.message).join(', ');
      statusCode = 400;
    } else if (error.name === 'CastError') {
      message = 'Invalid user ID format';
      statusCode = 400;
    } else if (error.code === 11000) {
      message = 'User with this email already exists';
      statusCode = 409;
    }
    
    res.status(statusCode).json({
      error: 'Failed to update user role',
      message
    });
  }
});

router.delete('/admin/users/:id', requireJWTAdmin, async (req, res) => {
  try {
    // Prevent admin from deleting their own account
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'You cannot delete your own account.'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Delete all posts by this user
    await Article.deleteMany({ authorId: req.params.id });

    // Delete all media uploaded by this user
    const Media = require('../models/Media');
    await Media.deleteMany({ uploadedBy: req.params.id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user'
    });
  }
});

module.exports = router;
