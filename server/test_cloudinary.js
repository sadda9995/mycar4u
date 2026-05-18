const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOptions = {
    folder: 'mycar4u_uploads',
    transformation: [{ width: 1000, crop: "limit" }]
};

if (process.env.CLOUDINARY_UPLOAD_PRESET) {
    uploadOptions.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
}

const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

const stream = cloudinary.uploader.upload_stream(
    uploadOptions,
    (error, result) => {
        if (error) {
            console.error("Cloudinary Upload Error:", error);
        } else {
            console.log("Upload Success:", result.secure_url);
        }
    }
);

stream.end(buffer);
