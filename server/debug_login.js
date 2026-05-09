const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const username = 'admin';
        const password = 'password123';

        console.log(`Testing login for: ${username}`);

        // Check for user
        const user = await User.findOne({ username }).select('+password');

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log('User found:', user.username);
        console.log('Stored Hashed Password:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password Match:', isMatch);

        if (isMatch) {
            const token = jwt.sign(
                { id: user._id, role: user.role, mobile: user.mobile },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );
            console.log('Token Generated:', token);
        }

        process.exit();
    } catch (error) {
        console.error('Error testing login:', error);
        process.exit(1);
    }
};

testLogin();
