const Razorpay = require('razorpay');
const crypto = require('crypto');
const Car = require('../models/Car');
const Booking = require('../models/Booking');

const calcPriceBreakdown = (car, startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const totalHours = Math.abs(end - start) / 36e5;
    const days = Math.floor(totalHours / 24);
    const hours = Math.ceil(totalHours % 24);

    const tripFare = (days * car.pricePerDay) + (hours * car.pricePerHour);
    const total = tripFare;

    return { total };
};

// Initialize Razorpay
// NOTE: Make sure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are in .env
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { carId, startTime, endTime } = req.body;

        const car = await Car.findById(carId);
        if (!car) return res.status(404).json({ message: 'Car not found' });

        // Calculate Amount (match frontend + booking controller)
        const { total: totalAmount } = calcPriceBreakdown(car, startTime, endTime);

        // Create Order options
        const options = {
            amount: totalAmount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Payment initiation failed', error: error.message });
    }
};

// @desc    Get all payments (Derived from Bookings)
// @route   GET /api/payment/all
// @access  Admin
exports.getAllPayments = async (req, res) => {
    try {
        // Fetch bookings with valid payment info
        const payments = await Booking.find({
            totalAmount: { $gt: 0 }
        })
            .populate({
                path: 'car',
                select: 'location.city officeId',
                populate: { path: 'officeId', select: 'name cityId' }
            })
            .populate('user', 'name mobile')
            .select('bookingId totalAmount paymentStatus createdAt paymentMode extraKmFee lateFee car')
            .sort({ createdAt: -1 });

        let filtered = payments;
        if (req.user?.role === 'city_admin' && req.user.cityId) {
            const cityDoc = await require('../models/City').findById(req.user.cityId);
            if (cityDoc) filtered = payments.filter(p => p.car?.location?.city === cityDoc.name);
        }
        if (req.user?.role === 'office_staff' && req.user.cityId) {
            const cityDoc = await require('../models/City').findById(req.user.cityId);
            if (cityDoc) filtered = payments.filter(p => p.car?.location?.city === cityDoc.name);
            if (req.user.officeId) {
                filtered = filtered.filter(p => (p.car?.officeId?._id || p.car?.officeId) === req.user.officeId.toString());
            }
        }

        res.status(200).json(filtered);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/payment/webhook
// @access  Public
exports.verifyWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        if (!secret) return res.status(200).json({ status: 'ignored' }); // Webhook secret not set

        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest === signature) {
            console.log('Webhook Verified');
            const event = req.body.event;
            
            if (event === 'payment.captured') {
                const { payload } = req.body;
                const orderId = payload.payment.entity.order_id;
                // Note: Real implementation would find the booking and confirm it here
                console.log('Payment Captured for Order:', orderId);
            }
            
            res.status(200).json({ status: 'ok' });
        } else {
            res.status(400).json({ status: 'invalid signature' });
        }
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
