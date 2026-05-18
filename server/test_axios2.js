const axios = require('axios');
const FormData = require('form-data');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const token = jwt.sign({ id: '6982e723cce7dd129661d9d7' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1h' });

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
});

async function test() {
    const data = new FormData();
    data.append('image', Buffer.from('test'), { filename: 'test.png', contentType: 'image/png' });

    // Test 2: multipart/form-data explicitly
    try {
        console.log('--- Test 2: Explicit header ---');
        const res = await api.post('/upload', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('Success:', res.data);
    } catch (e) {
        console.error('Failed:', e.response?.data || e.message);
    }
    
    // Test 3: delete content-type
    try {
        console.log('--- Test 3: Delete explicit ---');
        const res = await api.post('/upload', data, {
            headers: { 'Content-Type': undefined }
        });
        console.log('Success:', res.data);
    } catch (e) {
        console.error('Failed:', e.response?.data || e.message);
    }
}
test();
