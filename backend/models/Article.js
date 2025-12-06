const mongoose = require('mongoose');

const generateSlug = (value) => {
  return value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
    trim: true
  },
  excerpt: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: [
      function() {
        return this.status === 'Published';
      },
      'Content is required for published articles'
    ]
  },
  contentMarkdown: {
    type: String
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  imageUrl: {
    type: String
  },
  featuredImageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  },
  categories: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['Draft', 'Review', 'Scheduled', 'Published', 'Archived'],
    default: 'Draft'
  },
  publishedAt: {
    type: Date
  },
  scheduledAt: {
    type: Date
  },
  readingTime: {
    type: Number // in minutes
  },
  wordCount: {
    type: Number
  },
  views: {
    type: Number,
    default: 0
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  seoTitle: {
    type: String,
    trim: true
  },
  seoDescription: {
    type: String,
    trim: true
  },
  canonicalUrl: {
    type: String,
    trim: true
  },
  socialImage: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
articleSchema.index({ status: 1 });
articleSchema.index({ author: 1 });
articleSchema.index({ authorId: 1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ slug: 1 });
articleSchema.index({ title: 'text', content: 'text', excerpt: 'text' }); // Text index for search
articleSchema.index({ categories: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ isFeatured: 1 });

// Auto-generate and ensure unique slug
articleSchema.pre('validate', async function(next) {
  try {
    if (this.title && (!this.slug || this.isModified('title'))) {
      this.slug = generateSlug(this.title);
    } else if (this.slug) {
      this.slug = generateSlug(this.slug);
    }

    if (!this.slug) {
      this.slug = 'untitled';
    }

    if (this.isNew || this.isModified('slug')) {
      const baseSlug = this.slug;
      let slugToUse = baseSlug;
      let counter = 1;

      while (
        await this.constructor.exists({
          slug: slugToUse,
          _id: { $ne: this._id }
        })
      ) {
        slugToUse = `${baseSlug}-${counter++}`;
      }

      this.slug = slugToUse;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Set published date when status changes to Published
articleSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'Published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

module.exports = mongoose.model('Article', articleSchema);
