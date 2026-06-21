import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import cloudinary from '../config/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'manager'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, errors: ['No file uploaded'] });
    }

    // Upload to Cloudinary using a stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'frostflow_products' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      data: result.secure_url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, errors: ['Failed to upload image'] });
  }
});

export default router;
