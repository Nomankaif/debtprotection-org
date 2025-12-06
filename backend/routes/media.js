const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Media = require('../models/Media');
const { requireJWTAuth } = require('../middleware/jwtAuth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'media-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, PDFs and documents are allowed.'));
    }
  }
});

// Get all media files
router.get('/media', requireJWTAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Search functionality
    if (req.query.q) {
      filter.$or = [
        { filename: { $regex: req.query.q, $options: 'i' } },
        { originalName: { $regex: req.query.q, $options: 'i' } },
        { altText: { $regex: req.query.q, $options: 'i' } }
      ];
    }
    
    // Filter by type
    if (req.query.type) {
      if (req.query.type === 'images') {
        filter.mimeType = { $regex: '^image/' };
      } else if (req.query.type === 'videos') {
        filter.mimeType = { $regex: '^video/' };
      } else if (req.query.type === 'documents') {
        filter.mimeType = { $regex: '^application/' };
      }
    }
    
    const media = await Media.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'name email')
      .lean();
    
    const total = await Media.countDocuments(filter);
    
    res.json({
      media,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      error: 'Failed to fetch media files',
      message: error.message
    });
  }
});

// Upload media file
router.post('/media', requireJWTAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }
    
    // Generate URL for the uploaded file
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5011}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    // Create media record
    const media = new Media({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: fileUrl,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id,
      altText: req.body.altText || '',
      caption: req.body.caption || ''
    });
    
    await media.save();
    
    const populatedMedia = await Media.findById(media._id)
      .populate('uploadedBy', 'name email');
    
    res.status(201).json(populatedMedia);
  } catch (error) {
    console.error('Upload media error:', error);
    
    // Clean up uploaded file if database operation fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }
    }
    
    res.status(500).json({
      error: 'Failed to upload file',
      message: error.message
    });
  }
});

// Update media metadata
router.put('/media/:id', requireJWTAuth, async (req, res) => {
  try {
    const { altText, caption, tags } = req.body;
    
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({
        error: 'Media not found'
      });
    }
    
    // Check if user can edit this media (admin or uploader)
    if (req.user.role !== 'admin' && media.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only edit your own uploads'
      });
    }
    
    // Update fields
    if (altText !== undefined) media.altText = altText;
    if (caption !== undefined) media.caption = caption;
    if (tags !== undefined) media.tags = tags;
    
    await media.save();
    
    const updatedMedia = await Media.findById(media._id)
      .populate('uploadedBy', 'name email');
    
    res.json(updatedMedia);
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({
      error: 'Failed to update media',
      message: error.message
    });
  }
});

// Delete media file
router.delete('/media/:id', requireJWTAuth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({
        error: 'Media not found'
      });
    }
    
    // Check if user can delete this media (admin or uploader)
    if (req.user.role !== 'admin' && media.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own uploads'
      });
    }
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, '../uploads', media.filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.warn('Failed to delete file from filesystem:', fileError);
      // Continue with database deletion even if file deletion fails
    }
    
    // Delete from database
    await Media.findByIdAndDelete(req.params.id);
    
    res.json({
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      error: 'Failed to delete media',
      message: error.message
    });
  }
});

// Get media usage statistics
router.get('/media/stats', requireJWTAuth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { uploadedBy: req.user.id };
    
    const [
      totalFiles,
      imageCount,
      videoCount,
      documentCount,
      totalSize
    ] = await Promise.all([
      Media.countDocuments(filter),
      Media.countDocuments({ ...filter, mimeType: { $regex: '^image/' } }),
      Media.countDocuments({ ...filter, mimeType: { $regex: '^video/' } }),
      Media.countDocuments({ ...filter, mimeType: { $regex: '^application/' } }),
      Media.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$size' } } }
      ])
    ]);
    
    res.json({
      totalFiles,
      imageCount,
      videoCount,
      documentCount,
      totalSize: totalSize[0]?.total || 0
    });
  } catch (error) {
    console.error('Get media stats error:', error);
    res.status(500).json({
      error: 'Failed to get media statistics',
      message: error.message
    });
  }
});

module.exports = router;