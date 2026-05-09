const Booking = require('../models/Booking');
const User = require('../models/User');
const Car = require('../models/Car');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue (Sum of totalAmount for non-cancelled bookings)
        const revenueAgg = await Booking.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // 2. Active Rentals
        const activeRentals = await Booking.countDocuments({ status: 'active' });

        // 3. Total Customers
        const totalCustomers = await User.countDocuments({ role: 'user' });

        // 4. Pending Issues (For now, treat pending bookings as "issues" or action items)
        const pendingIssues = await Booking.countDocuments({ status: 'pending' });

        // 5. Recent Activity (Last 5 bookings)
        const recentActivity = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name mobile')
            .populate('car', 'make model registrationNumber');

        // 6. Chart Data (Revenue per day for last 7 days)
        // This is a bit complex for MVP aggregation, let's just return mock chart data or simple aggregation
        // For MVP speed, we'll keep the chart data static or simple

        const stats = {
            totalRevenue,
            activeRentals,
            totalCustomers,
            pendingIssues,
            recentActivity
            // chartData: ... 
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
