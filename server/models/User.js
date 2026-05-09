const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    mobile: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    name: {
        type: String,
    },
    username: {
        type: String,
        unique: true,
        sparse: true // Allows null/undefined to be duplicated (for users without username)
    },
    password: {
        type: String,
        select: false // Do not return password by default
    },
    activationToken: String,
    activationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    email: { // Optional, but good for communication
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    role: {
        type: String,
        enum: ['user', 'office_staff', 'city_admin', 'super_admin'],
        default: 'user'
    },
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    },
    officeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Office'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    drivingLicense: {
        number: String,
        imageFront: String,
        imageBack: String,
        expiryDate: Date
    },
    aadhaar: {
        number: String,
        imageFront: String,
        imageBack: String
    },
    walletBalance: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
