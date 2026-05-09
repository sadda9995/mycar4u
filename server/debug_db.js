const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('--- DB Check ---');
        console.log('URI:', process.env.MONGO_URI);

        const bookingCount = await Booking.countDocuments();
        const userCount = await User.countDocuments();

        console.log(`Bookings: ${bookingCount}`);
        console.log(`Users: ${userCount}`);

        if (bookingCount > 0) {
            const b = await Booking.findOne();
            console.log('Sample Booking:', JSON.stringify(b, null, 2));
        } else {
            console.log('No bookings found.');
        }

        process.exit();
    })
    .catch(err => {
        console.error('DB Error:', err);
        process.exit(1);
    });
