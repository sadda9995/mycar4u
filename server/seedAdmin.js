const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('Error', err));

const seedAdmin = async () => {
    try {
        const mobile = '9999999999';
        await User.deleteOne({ mobile }); // Clear if exists

        const admin = new User({
            mobile,
            name: 'Super Admin',
            role: 'admin',
            isVerified: true
        });

        await admin.save();
        console.log('Admin User Created: 9999999999');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
