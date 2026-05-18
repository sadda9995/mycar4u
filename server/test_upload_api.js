const express = require('express');
const uploadRoutes = require('./routes/uploadRoutes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const authMiddleware = require('./middleware/authMiddleware');
authMiddleware.protect = (req, res, next) => next();
authMiddleware.admin = (req, res, next) => next();

app.use('/api/upload', uploadRoutes);

const server = app.listen(5001, () => {
    console.log('Test server running on port 5001');
    const FormData = require('form-data');
    const fs = require('fs');

    fs.writeFileSync('test_image.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'));

    const form = new FormData();
    form.append('image', fs.createReadStream('test_image.png'));

    fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
    })
    .then(res => res.json().then(data => ({ status: res.status, data })))
    .then(result => {
        console.log('Upload Result:', result);
        server.close();
        fs.unlinkSync('test_image.png');
    })
    .catch(err => {
        console.error('Fetch error:', err);
        server.close();
        fs.unlinkSync('test_image.png');
    });
});
