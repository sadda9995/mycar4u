const express = require('express');
const { upload, uploadToCloudinary } = require('./middleware/uploadMiddleware');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.post('/api/upload', upload.single('image'), uploadToCloudinary, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
        message: 'File uploaded successfully',
        filePath: req.file.path
    });
});

app.use((error, req, res, next) => {
    if (error) {
        return res.status(400).json({ message: error.message });
    }
    next();
});

const server = app.listen(5002, async () => {
    console.log('Test server running on port 5002');

    const form = new FormData();
    const blob = new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')], { type: 'image/png' });
    form.append('image', blob, 'test_image.png');

    try {
        const res = await fetch('http://localhost:5002/api/upload', {
            method: 'POST',
            body: form
        });
        const data = await res.json();
        console.log('Upload Result:', { status: res.status, data });
    } catch(err) {
        console.error('Fetch error:', err);
    } finally {
        server.close();
    }
});
