const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    make: {
        type: String,
        required: true // e.g., Maruti
    },
    model: {
        type: String,
        required: true // e.g., Swift
    },
    type: {
        type: String,
        enum: ['Hatchback', 'Sedan', 'SUV', 'Luxury'],
        required: true
    },
    image: [{
        type: String // URL
    }],
    pricePerHour: {
        type: Number,
        required: true
    },
    pricePerDay: {
        type: Number,
        required: true
    },
    dailyKmLimit: {
        type: Number,
        default: 300
    },
    extraKmCharge: {
        type: Number,
        required: true
    },
    lateFeePerHour: {
        type: Number,
        required: true
    },
    fuelType: {
        type: String,
        enum: ['Petrol', 'Diesel', 'CNG', 'EV'],
        required: true
    },
    transmission: {
        type: String,
        enum: ['Manual', 'Automatic'],
        required: true
    },
    seats: {
        type: Number,
        default: 5
    },
    fastTagId: String,
    rcStatus: {
        type: String,
        default: 'Valid'
    },
    pollutionCertExpiry: Date,
    insuranceExpiry: Date,
    location: {
        address: String,
        city: { type: String, required: true },
        coordinates: {
            type: [Number], // [Longitude, Latitude]
            index: '2dsphere'
        }
    },
    officeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Office'
    },
    // Enhanced Details
    year: { type: Number, required: true },
    kmsDriven: { type: Number, required: true },
    engine: {
        capacity: String, // e.g. 1197 cc
        power: String,    // e.g. 88 bhp
        torque: String,   // e.g. 113 Nm
        fuelTank: String  // e.g. 37 Litres
    },
    dimensions: {
        length: String,   // e.g. 3845 mm
        width: String,    // e.g. 1735 mm
        bootSpace: String,// e.g. 268 Litres
        groundClearance: String // e.g. 170 mm
    },
    safety: {
        airbags: Number,
        abs: { type: Boolean, default: true },
        ncapRating: Number
    },
    features: [String],
    maintenanceWindows: [{
        start: Date,
        end: Date,
        reason: String,
        createdAt: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['available', 'maintenance', 'booked'],
        default: 'available'
    }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
