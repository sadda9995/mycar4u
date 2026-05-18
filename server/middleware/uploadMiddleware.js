const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage for Multer
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
        if (allowedFormats.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file format. Only JPG, PNG, WEBP, and GIF are allowed.'), false);
        }
    }
});

const uploadToCloudinary = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const uploadOptions = {
        folder: 'mycar4u_uploads',
        transformation: [{ width: 1000, crop: "limit" }]
    };

    if (process.env.CLOUDINARY_UPLOAD_PRESET) {
        uploadOptions.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
    }

    const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
            if (error) {
                console.error("Cloudinary Upload Error:", error);
                return res.status(500).json({ message: 'Image upload failed', error: error.message });
            }
            // Assign the secure url to req.file.path to maintain compatibility with existing routes
            req.file.path = result.secure_url;
            next();
        }
    );

    stream.end(req.file.buffer);
};

module.exports = { upload, uploadToCloudinary };
