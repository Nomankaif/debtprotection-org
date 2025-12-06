const express = require('express');
const upload = require('../middleware/upload');
const { requireJWTAuth } = require('../middleware/jwtAuth');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Image upload endpoint
router.post('/upload', requireJWTAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file && !req.body.imageUrl) {
      return res.status(400).json({
        error: 'No file or URL provided',
        message: 'Please select an image to upload or provide an image URL'
      });
    }

    let imageUrl;

    // Handle URL-based image upload
    if (req.body.imageUrl) {
      try {
        const url = req.body.imageUrl;

        // Validate URL format
        if (!url.match(/^https?:\/\/.+/)) {
          return res.status(400).json({
            error: 'Invalid URL',
            message: 'Please provide a valid HTTP or HTTPS URL'
          });
        }

        // Download image from URL
        const response = await axios({
          method: 'GET',
          url: url,
          responseType: 'stream',
          timeout: 10000 // 10 second timeout
        });

        // Validate content type
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
          return res.status(400).json({
            error: 'Invalid image URL',
            message: 'The provided URL does not point to a valid image'
          });
        }

        // Generate filename
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(url) || '.jpg'; // Default to jpg if no extension
        const filename = `url-${uniqueSuffix}${ext}`;
        const filepath = path.join(uploadsDir, filename);

        // Save image to file
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5011}`;
        imageUrl = `${baseUrl}/uploads/${filename}`;

        // Create Media record in DB for this downloaded file
        try {
          const Media = require('../models/Media');
          const media = new Media({
            filename,
            originalName: path.basename(url),
            url: imageUrl,
            mimeType: contentType,
            size: fs.statSync(filepath).size,
            uploadedBy: req.user?.id || null,
            altText: req.body.altText || '',
            caption: req.body.caption || ''
          });

          await media.save();

          const populated = await Media.findById(media._id).populate('uploadedBy', 'name email');

          // Return success response with media object and url
          return res.status(201).json({
            success: true,
            media: populated,
            imageUrl: imageUrl,
            message: 'Image uploaded successfully from URL'
          });
        } catch (dbErr) {
          console.error('Failed to save media record:', dbErr);
          // still return the URL so frontend can use the uploaded file
          return res.status(201).json({
            success: true,
            imageUrl: imageUrl,
            message: 'Image uploaded but failed to save media record'
          });
        }

      } catch (urlError) {
        console.error('URL upload error:', urlError.message);
        return res.status(400).json({
          error: 'Failed to download image from URL',
          message: 'The provided URL is not accessible or does not contain a valid image'
        });
      }
    } else {
      // Handle file upload
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5011}`;
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

      // Create Media record in DB for this uploaded file
      try {
        const Media = require('../models/Media');
        const media = new Media({
          filename: req.file.filename,
          originalName: req.file.originalname || req.file.filename,
          url: imageUrl,
          mimeType: req.file.mimetype,
          size: req.file.size,
          uploadedBy: req.user?.id || null,
          altText: req.body.altText || '',
          caption: req.body.caption || ''
        });

        await media.save();

        const populated = await Media.findById(media._id).populate('uploadedBy', 'name email');

        return res.status(201).json({
          success: true,
          media: populated,
          imageUrl: imageUrl,
          message: 'Image uploaded successfully'
        });
      } catch (dbErr) {
        console.error('Failed to save media record:', dbErr);
        return res.status(201).json({
          success: true,
          imageUrl: imageUrl,
          message: 'Image uploaded but failed to save media record'
        });
      }
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Failed to upload image'
    });
  }
});

module.exports = router;