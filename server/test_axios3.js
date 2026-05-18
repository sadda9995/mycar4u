const axios = require('axios');
const FormData = require('form-data');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

require('dotenv').config();

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const superAdmin = await User.findOne({ email: 'admin@mycar4u.com' });
    const token = jwt.sign({ id: superAdmin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = new FormData();
    data.append('image', Buffer.from('test'), { filename: 'test.png', contentType: 'image/png' });

    // Test 2: explicit header
    try {
        console.log('--- Test 2: Explicit header ---');
        const res = await api.post('/upload', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('Success:', res.data);
    } catch (e) {
        console.error('Failed:', e.response?.data || e.message);
    }
    
    // Test 3: undefined
    try {
        console.log('--- Test 3: Delete explicit ---');
        const res = await api.post('/upload', data, {
            headers: { 'Content-Type': undefined }
        });
        console.log('Success:', res.data);
    } catch (e) {
        console.error('Failed:', e.response?.data || e.message);
    }

    mongoose.connection.close();
}
test();
