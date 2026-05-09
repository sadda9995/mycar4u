const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const username = 'admin';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if admin exists by username OR mobile
        let admin = await User.findOne({
            $or: [{ username }, { mobile: '9999999999' }]
        });

        if (admin) {
            console.log('Admin user found. Updating credentials...');
            admin.username = username;
            admin.password = hashedPassword;
            admin.role = 'admin';
            admin.mobile = '9999999999'; // Ensure mobile is set
            await admin.save();
        } else {
            console.log('Creating new admin user...');
            admin = new User({
                name: 'Super Admin',
                username: username,
                password: hashedPassword,
                mobile: '9999999999',
                role: 'admin',
                isVerified: true
            });
            await admin.save();
        }

        console.log(`Admin User Setup Complete.`);
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);

        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
