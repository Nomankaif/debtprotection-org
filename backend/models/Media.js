const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  altText: {
    type: String,
    trim: true
  },
  caption: {
    type: String,
    trim: true
  },
  tags: {
    type: [String],
    default: []
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ mimeType: 1 });
mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ filename: 'text', originalName: 'text', altText: 'text' });

module.exports = mongoose.model('Media', mediaSchema);