const express = require('express');
const router = express.Router();
const { upload, uploadToCloudinary } = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize(['super_admin', 'admin', 'city_admin', 'office_staff']), upload.single('image'), uploadToCloudinary, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Cloudinary returns the full secure URL in req.file.path from our custom middleware
    res.json({
        message: 'File uploaded successfully',
        filePath: req.file.path
    });
});

// Error handling middleware specifically for multer errors (e.g. file size, file filter)
router.use((error, req, res, next) => {
    if (error) {
        return res.status(400).json({ message: error.message });
    }
    next();
});

module.exports = router;
