const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String, // Public friendly ID
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    allowedKm: {
        type: Number,
        required: true
    },
    extraKmCharge: {
        type: Number, // Snapshot
        required: true
    },
    lateFeePerHour: {
        type: Number, // Snapshot
        required: true
    },
    securityDeposit: {
        type: Number,
        default: 0
    },
    protectionPackage: {
        type: String,
        enum: ['standard', 'peace_of_mind'],
        default: 'standard'
    },
    fuelPolicy: {
        type: String,
        default: 'full_to_full'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    startOdometer: Number,
    endOdometer: Number,
    startFuelLevel: Number, // Percentage
    endFuelLevel: Number, // Percentage
    penalty: {
        type: Number,
        default: 0
    },
    violationCount: {
        type: Number,
        default: 0
    },
    startCleanliness: String,
    endCleanliness: String,
    damagePhotos: [String],
    lateReturnHours: Number,
    extraKmFee: {
        type: Number,
        default: 0
    },
    lateFee: {
        type: Number,
        default: 0
    },
    reminderSent: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
