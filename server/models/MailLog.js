const mongoose = require('mongoose');

const mailLogSchema = new mongoose.Schema({
    to: {
        type: String,
        required: true,
        index: true
    },
    from: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    templateName: {
        type: String
    },
    status: {
        type: String,
        enum: ['sent', 'failed'],
        default: 'sent'
    },
    resendId: {
        type: String
    },
    errorMessage: {
        type: String
    },
    sentAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('MailLog', mailLogSchema);
