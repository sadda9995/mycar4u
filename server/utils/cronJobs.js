const cron = require('node-cron');
const Booking = require('../models/Booking');
const { sendEmail } = require('./notifier');
const { bookingReminderTemplate } = require('./emailTemplates');

/**
 * Initialize all scheduled jobs
 */
const initCronJobs = () => {
    // Run every hour to check for upcoming bookings (24h lead time)
    cron.schedule('0 * * * *', async () => {
        console.log('Running 24h Booking Reminder Job...');
        try {
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const tomorrowPlusHour = new Date(tomorrow.getTime() + 60 * 60 * 1000);

            // Find bookings starting in exactly 24 hours (within 1 hour window)
            const upcoming = await Booking.find({
                status: 'confirmed',
                startTime: { $gte: tomorrow, $lt: tomorrowPlusHour },
                reminderSent: { $ne: true } // Ensure we don't send twice
            }).populate('user').populate('car');

            for (const booking of upcoming) {
                if (booking.user?.email) {
                    await sendEmail({
                        to: booking.user.email,
                        subject: `Reminder: Your trip starts tomorrow! (#${booking.bookingId})`,
                        html: bookingReminderTemplate({
                            carName: `${booking.car.make} ${booking.car.model}`,
                            pickupTime: new Date(booking.startTime).toLocaleString('en-IN'),
                            location: booking.car.location?.city || 'Selected Hub'
                        }),
                        templateName: 'booking_reminder'
                    });
                    
                    // Mark as sent
                    booking.reminderSent = true;
                    await booking.save();
                }
            }
        } catch (err) {
            console.error('Error in Booking Reminder Job:', err.message);
        }
    });
};

module.exports = { initCronJobs };
