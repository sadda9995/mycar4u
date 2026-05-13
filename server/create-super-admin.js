const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@mycar4u.com';
        const password = 'Admin@123';

        // 1. Delete existing super admins
        const deleteResult = await User.deleteMany({ role: 'super_admin' });
        console.log(`Deleted ${deleteResult.deletedCount} existing super admins`);

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create new super admin
        const superAdmin = new User({
            email,
            username: 'admin',
            password: hashedPassword,
            role: 'super_admin',
            name: 'Super Admin',
            isVerified: true
        });

        await superAdmin.save();
        console.log('Super Admin created successfully');
        console.log('Email:', email);
        console.log('Password:', password);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error creating super admin:', error);
        process.exit(1);
    }
};

createSuperAdmin();
