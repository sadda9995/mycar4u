const Booking = require('../models/Booking');
const Car = require('../models/Car');
const City = require('../models/City');
const { sendEmail } = require('../utils/notifier');
const { bookingConfirmationTemplate, bookingCancellationTemplate, rentalStartedTemplate, rentalEndedTemplate, adminNewBookingTemplate, paymentReceiptTemplate } = require('../utils/emailTemplates');
const { generatePdf } = require('../utils/pdfGenerator');

const calcPriceBreakdown = (car, startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const totalHours = Math.abs(end - start) / 36e5;
    const days = Math.floor(totalHours / 24);
    const hours = Math.ceil(totalHours % 24);

    const tripFare = (days * car.pricePerDay) + (hours * car.pricePerHour);
    const total = tripFare;

    return { days, hours, tripFare, total };
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        console.log('--- Create Booking Request ---');
        console.log('Body:', req.body);
        console.log('User:', req.user);

        const { carId, startTime, endTime } = req.body;

        const car = await Car.findById(carId);
        if (!car) {
            console.log('Error: Car not found');
            return res.status(404).json({ message: 'Car not found' });
        }

        // Simple availability check (Overlapping dates)
        // In a real app, this needs to be more robust (concurrency safe)
        const conflict = await Booking.findOne({
            car: carId,
            status: { $in: ['confirmed', 'active'] }, // Ignore cancelled/completed for blocking
            $or: [
                { startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } }
            ]
        });

        if (conflict) {
            return res.status(400).json({ message: 'Car is already booked for these dates' });
        }

        // --- Payment Verification (Razorpay) ---
        const { paymentResult } = req.body;
        if (paymentResult) {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentResult;

            const crypto = require('crypto');
            const body = razorpay_order_id + "|" + razorpay_payment_id;

            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            console.log('Signature received:', razorpay_signature);
            console.log('Signature expected:', expectedSignature);

            if (razorpay_signature !== 'mock_signature' && expectedSignature !== razorpay_signature) {
                console.log('Error: Payment verification failed');
                return res.status(400).json({ message: 'Payment verification failed' });
            }
        }
        // ---------------------------------------

        // Calculate Price (Matching Frontend Formula)
        const { total, days } = calcPriceBreakdown(car, startTime, endTime);
        const totalHours = Math.abs(new Date(endTime) - new Date(startTime)) / 36e5;
        const allowedKm = Math.ceil(totalHours / 24) * car.dailyKmLimit;

        const booking = new Booking({
            user: req.user._id,
            car: carId,
            startTime,
            endTime,
            totalAmount: total,
            allowedKm,
            extraKmCharge: car.extraKmCharge,
            lateFeePerHour: car.lateFeePerHour,
            bookingId: 'BK' + Date.now(), // Simple ID generation
            status: 'confirmed' // Auto-confirm for MVP
        });

        await booking.save();
        
        // --- Send Confirmation Emails ---
        // 1. Customer Confirmation & Receipt
        const receiptDetails = {
            transactionId: paymentResult?.razorpay_payment_id || 'OFFLINE_' + booking.bookingId,
            amount: total.toLocaleString('en-IN'),
            date: new Date().toLocaleDateString('en-IN'),
            method: paymentResult ? 'Razorpay' : 'Offline'
        };

        const receiptHtml = paymentReceiptTemplate(receiptDetails);
        
        // Generate PDF async
        generatePdf(receiptHtml).then(pdfBuffer => {
            sendEmail({
                to: req.user.email,
                from: 'Accounts <billing@mycar4u.com>',
                subject: `Booking Confirmed: #${booking.bookingId}`,
                html: bookingConfirmationTemplate({
                    bookingId: booking.bookingId,
                    carName: `${car.make} ${car.model}`,
                    startDate: new Date(startTime).toLocaleString('en-IN'),
                    endDate: new Date(endTime).toLocaleString('en-IN'),
                    totalAmount: total.toLocaleString('en-IN')
                }),
                templateName: 'booking_confirmation',
                attachments: [
                    {
                        filename: `Receipt_${booking.bookingId}.pdf`,
                        content: pdfBuffer
                    }
                ]
            }).catch(e => console.error('Failed to send customer booking confirmation:', e.message));
        }).catch(e => {
            console.error('Failed to generate receipt PDF:', e.message);
            // Fallback: send email without PDF
            sendEmail({
                to: req.user.email,
                subject: `Booking Confirmed: #${booking.bookingId}`,
                html: bookingConfirmationTemplate({
                    bookingId: booking.bookingId,
                    carName: `${car.make} ${car.model}`,
                    startDate: new Date(startTime).toLocaleString('en-IN'),
                    endDate: new Date(endTime).toLocaleString('en-IN'),
                    totalAmount: total.toLocaleString('en-IN')
                }),
                templateName: 'booking_confirmation'
            });
        });

        // 2. Admin Notification
        sendEmail({
            to: process.env.ADMIN_EMAIL || 'admin@mycar4u.com',
            subject: `New Booking Alert: #${booking.bookingId}`,
            from: 'Operations <ops@mycar4u.com>',
            html: adminNewBookingTemplate({
                bookingId: booking.bookingId,
                customerName: req.user.name || req.user.email,
                carName: `${car.make} ${car.model}`,
                city: car.location?.city || 'Unknown'
            }),
            templateName: 'admin_booking_alert'
        }).catch(e => console.error('Failed to send admin booking alert:', e.message));

        res.status(201).json(booking);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get my bookings
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('car', 'make model image registrationNumber')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Admin
exports.getAllBookings = async (req, res) => {
    try {
        const { status, startDate, endDate, search } = req.query;

        let query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (search) {
            query.$or = [
                { bookingId: { $regex: search, $options: 'i' } }
            ];
        }

        let bookings = await Booking.find(query)
            .populate('user', 'name mobile email')
            .populate('car', 'make model registrationNumber image location.city')
            .sort({ createdAt: -1 });

        if (req.user?.role === 'city_admin' && req.user.cityId) {
            const cityDoc = await City.findById(req.user.cityId);
            if (cityDoc) bookings = bookings.filter(b => b.car?.location?.city === cityDoc.name);
        }
        if (req.user?.role === 'office_staff' && req.user.cityId) {
            const cityDoc = await City.findById(req.user.cityId);
            if (cityDoc) bookings = bookings.filter(b => b.car?.location?.city === cityDoc.name);
        }

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get single booking by ID (Admin)
// @route   GET /api/bookings/:id
// @access  Admin
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name mobile email')
            .populate('car', 'make model registrationNumber image');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update booking (admin ops)
// @route   PUT /api/bookings/:id
// @access  Admin
exports.updateBooking = async (req, res) => {
    try {
        const allowed = [
            'status',
            'paymentStatus',
            'startOdometer',
            'endOdometer',
            'startFuelLevel',
            'endFuelLevel',
            'startCleanliness',
            'endCleanliness',
            'damagePhotos',
            'lateReturnHours',
            'extraKmFee',
            'lateFee',
            'penalty',
            'violationCount'
        ];

        const updates = {};
        Object.keys(req.body || {}).forEach(key => {
            if (allowed.includes(key)) updates[key] = req.body[key];
        });

        const existing = await Booking.findById(req.params.id).populate('car');
        if (!existing) return res.status(404).json({ message: 'Booking not found' });

        if (req.user?.role === 'city_admin' && req.user.cityId) {
            const cityDoc = await City.findById(req.user.cityId);
            if (cityDoc && existing.car?.location?.city !== cityDoc.name) {
                return res.status(403).json({ message: 'City scope violation' });
            }
        }
        const booking = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true })
            .populate('user', 'name mobile email')
            .populate('car', 'make model registrationNumber image');

        // --- Status Change Triggers ---
        if (updates.status && updates.status !== existing.status) {
            const customerEmail = booking.user?.email;
            if (customerEmail) {
                if (updates.status === 'active') {
                    sendEmail({
                        to: customerEmail,
                        subject: 'Your Trip Has Started!',
                        html: rentalStartedTemplate({
                            carName: `${booking.car.make} ${booking.car.model}`,
                            bookingId: booking.bookingId,
                            odometer: updates.startOdometer || booking.startOdometer
                        }),
                        templateName: 'rental_started'
                    }).catch(e => console.error('Failed to send rental started email:', e.message));
                } else if (updates.status === 'completed') {
                    sendEmail({
                        to: customerEmail,
                        subject: 'Thanks for riding with us!',
                        html: rentalEndedTemplate({
                            carName: `${booking.car.make} ${booking.car.model}`,
                            distance: (booking.endOdometer - booking.startOdometer) || 0,
                            duration: 'Your Trip', // We could calculate this
                            totalAmount: booking.totalAmount.toLocaleString('en-IN')
                        }),
                        templateName: 'rental_ended'
                    }).catch(e => console.error('Failed to send rental ended email:', e.message));
                } else if (updates.status === 'cancelled') {
                    sendEmail({
                        to: customerEmail,
                        subject: 'Booking Cancelled',
                        html: bookingCancellationTemplate({
                            bookingId: booking.bookingId,
                            carName: `${booking.car.make} ${booking.car.model}`,
                            refundAmount: booking.paymentStatus === 'paid' ? booking.totalAmount : 0
                        }),
                        templateName: 'booking_cancellation'
                    }).catch(e => console.error('Failed to send cancellation email:', e.message));
                }
            }
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
