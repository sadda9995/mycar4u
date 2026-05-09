const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the path relative to the server root (accessible via static middleware)
    // Assuming server serves 'public' folder as root or similar
    const filePath = `/uploads/${req.file.filename}`;
    res.json({
        message: 'File uploaded successfully',
        filePath: filePath
    });
});

module.exports = router;
