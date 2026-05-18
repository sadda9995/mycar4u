const axios = require('axios');
const FormData = require('form-data');

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

async function test() {
    const data = new FormData();
    data.append('image', Buffer.from('test'), { filename: 'test.png', contentType: 'image/png' });
    
    // Test 1: Just pass data
    try {
        console.log('--- Test 1: No headers ---');
        const res = await api.post('/upload', data);
        console.log('Success:', res.data);
    } catch (e) {
        console.error('Failed:', e.response?.data || e.message);
    }

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
    
    // Test 3: getHeaders()
    try {
        console.log('--- Test 3: form-data getHeaders() ---');
        const res = await api.post('/upload', data, {
            headers: data.getHeaders()
        });
        console.log('Success:', res.data);
    } catch (e) {
        console.error('Failed:', e.response?.data || e.message);
    }
}
test();
