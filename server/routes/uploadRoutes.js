const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Cloudinary returns the full secure URL in req.file.path
    res.json({
        message: 'File uploaded successfully',
        filePath: req.file.path
    });
});

module.exports = router;
