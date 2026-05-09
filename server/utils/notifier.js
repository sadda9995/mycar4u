const { Resend } = require('resend');
const MailLog = require('../models/MailLog');

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Default "From" address
const DEFAULT_FROM = process.env.RESEND_FROM || 'Mycar4u <team@mycar4u.com>';

/**
 * Send an email via Resend and log it to MongoDB
 * @param {Object} options - { to, subject, text, html, from, templateName, attachments }
 */
const sendEmail = async ({ to, subject, text, html, from, templateName, attachments }) => {
    if (!to || !subject || (!text && !html)) return false;

    const fromAddress = from || DEFAULT_FROM;

    if (!resend) {
        console.log('[email:not-configured]', { to, subject, text });
        return false;
    }

    let status = 'sent';
    let resendId = null;
    let errorMessage = null;

    try {
        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to,
            subject,
            text,
            html: html || (text ? `<p>${text.replace(/\n/g, '<br>')}</p>` : undefined),
            attachments: attachments || []
        });

        if (error) {
            status = 'failed';
            errorMessage = error.message || JSON.stringify(error);
            console.error('Resend error:', error);
        } else {
            resendId = data.id;
        }
    } catch (err) {
        status = 'failed';
        errorMessage = err.message;
        console.error('Email sending failed:', err.message);
    }

    // Log to MongoDB (Async, don't block the response)
    MailLog.create({
        to,
        from: fromAddress,
        subject,
        templateName,
        status,
        resendId,
        errorMessage
    }).catch(e => console.error('Failed to create MailLog:', e.message));

    return status === 'sent';
};

// SMS support removed as per user request (Moving to 100% email)
const sendSms = async () => {
    console.warn('SMS sending is disabled. Use sendEmail instead.');
    return false;
};

module.exports = { sendEmail, sendSms };
